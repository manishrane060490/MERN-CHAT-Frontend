import { AddIcon } from '@chakra-ui/icons';
import { Box, Button, Stack, useToast, Text } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { getSender } from '../config/utilFunc';
import { ChatState } from '../context/ChatProvider'
import Loading from './Loading';
import GroupChatModal from './miscellaneous/GroupChatModal';

const MyChats = () => {
  const {user, setUser, selectedChat, setSelectedChat, chats, setChats} = ChatState();
  const [loggedUser, setLoggeduser] = useState();

  const toast = useToast();

  const fetchedChats = async() => {
    try{
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          method: "get",
          url: "/api/chat"
        }
      }

      await axios(config).then(result => setChats(result.data));

    } catch(err) {
      toast({
        title: "Error occured",
        description: "Failed to load search results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left"
      })
      return;
    }
  }

  useEffect(() => {
    setLoggeduser(JSON.parse(localStorage.getItem("userInfo")));
    fetchedChats();
  },[])

  return (
    <Box
      display={{base: selectedChat ? "none" : "flex", md: "flex"}}
      flexDirection="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{base: "100%", md: "31%"}}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{base: "28px", md: "30px"}}
        fontFamily="Work Sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{base: "17px", md: "10px", lg:"17px"}}
            rightIcon={<AddIcon/>}
          >New Group Chat</Button>
        </GroupChatModal>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        p={3}
        bg="F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map(chat => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {
                    !chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName
                  }
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <Loading />
        )}
      </Box>
    </Box>
  )
}

export default MyChats