import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, FormControl, IconButton, Input, Spinner, Text, Toast, useToast } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { getSender, getSenderInfo } from '../config/utilFunc';
import { ChatState } from '../context/ChatProvider'
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import ScrollableChat from './ScrollableChat';

import io from 'socket.io-client';

const ENDPOINT = "http://localhost:8080";
var socket, selectedChatCompare;

function SingleChat({fetchAgain, setFetchAgain}) {

    const {user, selectedChat, setSelectedChat, notifications, setNotifications} = ChatState();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const toast = useToast();

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
    }, [])

    const fetchMessages = async () => {
        if(!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
            };

            setLoading(true);

            const {data} = await axios.get(`/api/message/${selectedChat._id}`, config);

            setMessages(data);
            setLoading(false);
            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Unable to fetch the messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
        }
    }

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat])

    const sendMessaege = async (e) => {
        if(e.key === "Enter" && newMessage) {
            try {
                const config = {
                    headers: {
                        "Content-Type" : "application/json",
                        Authorization: `Bearer ${user.token}`
                    },
                };

                const { data } = await axios.post("/api/message", {
                    content: newMessage,
                    chatId: selectedChat._id
                }, config)


                setNewMessage("");

                socket.emit("new message", data)

                setMessages([...messages, data])
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                });
            }
        }
    }

    useEffect(() => {
        socket.on("message received", (newMessageReceived) => {
            if(!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id){
                if(!notifications.includes(newMessageReceived)) {
                    setNotifications([newMessageReceived, ...notifications]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageReceived])
            }
        })
    })

    

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if(!socketConnected) return;

        if(!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }

        var lastTimeTyping = new Date().getTime();
        var timerLength = 3000;

        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTimeTyping;

            if(timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            } 
        }, timerLength)
    }

  return (
    <>
        {selectedChat ? (
            <>
                <Text
                    fontSize={{base: "28px", md: "30px"}}
                    pb={3}
                    px={2}
                    w="100%"
                    fontFamily="Work sans"
                    display="flex"
                    justifyContent={{base: "space-between"}}
                    alignItems="center"
                >
                    <IconButton
                        display={{base: "flex", md: "none"}}
                        icon={<ArrowBackIcon/>}
                        onClick={() => setSelectedChat("")}
                    />
                     {!selectedChat.isGroupChat ? (
                         <>
                            {getSender(user, selectedChat.users)}
                            <ProfileModal user={getSenderInfo(user, selectedChat.users)}/> 
                         </>
                     ) : (
                        <>
                            {selectedChat.chatName.toUpperCase()}
                            {<UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
                        </>
                     )}
                </Text>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="flex-end"
                    p={3}
                    bg="#E8E8E8"
                    w="100%"
                    h="100%"
                    borderRadius="lg"
                    overflowY="hidden"
                >
                    {
                        loading ? (
                            <Spinner size="xl" height={20} width={20} alignSelf="center" margin="auto"/>
                        ) : (
                            <div style={{ display:"flex", flexDirection:"column", overflowY:"scroll"}}>
                                <ScrollableChat messages={messages} />
                            </div>
                        )
                    }

                    <FormControl isRequired mt={3} onKeyDown={sendMessaege}>
                        {isTyping ? <div>Typing...</div> : (<></>)}
                        <Input placeholder='Enter a message' variant="filled" bg="#E0E0E0" onChange={e => typingHandler(e)} value={newMessage}/>
                    </FormControl>
                </Box>
            </>
        ) : (
            <Box
                display="flex" alignItems="center" justifyContent="center" height="100%"
            >
                <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                    Click on a user to start chatting
                </Text>
            </Box>
        )}
    </>
  )
}

export default SingleChat