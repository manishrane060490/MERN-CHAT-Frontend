import { ViewIcon } from '@chakra-ui/icons';
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react'
import axios from 'axios';
import React, { useState } from 'react'
import { ChatState } from '../../context/ChatProvider';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import UserListItem from '../UserAvatar/UserListItem';

function UpdateGroupChatModal({fetchAgain, setFetchAgain}) {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {selectedChat, setSelectedChat, user} = ChatState();

    const [search, setSearch] = useState("");
    const [groupChatName, setGroupChatName] = useState();
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);

    const toast = useToast();

    const handleRemove = async (userDel) => {
        if(selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only admins can add someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
            return;
        }

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
            };

            const {data} = axios.put("/api/chat/groupremove", {
                chatId: selectedChat._id,
                userId: userDel._id
            }, config)

            userDel._id === user._id ? setSelectedChat() : setSelectedChat(data);

            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                duration: 5000,
                status: "error",
                isClosable: true,
                position: "bottom"
            })
        }
    }
    const handleRename = async () => {
        if(!groupChatName) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const {data} = await axios.put("/api/chat/rename", {
                chatId: selectedChat._id,
                chatName: groupChatName
            }, config);
            
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
            
        } catch (err) {
            console.log(err);
            toast({
                title: "Error Occured",
                // description: err.response.data.message,
                duration: 5000,
                status: "error",
                isClosable: true,
                position: 'bottom'
            })
            setRenameLoading(false);

        }
        setGroupChatName("");
    }
    const searchUser = async (query) => {
        setSearch(query);
        if(!query) return;

        try{
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);

            setLoading(false);
            setSearchResult(data);

        } catch (err) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                duration: 5000,
                status: "error",
                isClosable: true,
                position: "bottom-left"
            });
            setLoading(false);
        }
    }

    const handleAddUser = async (userToAdd) => {
        if(selectedChat.users.find(u => u._id === userToAdd._id)) {
            toast({
                title: "User already in group!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
            return;
        }

        if(selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only admins can add someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
            return;
        }

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
            };

            const {data} = axios.put("/api/chat/groupadd", {
                chatId: selectedChat._id,
                userId: userToAdd._id
            }, config)

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                duration: 5000,
                status: "error",
                isClosable: true,
                position: "bottom"
            })
        }
    }
  return (
    <>
        <IconButton onClick={onOpen} display={{base: "flex"}} icon={<ViewIcon />} />

        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{selectedChat.chatName}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box display="flex" w="100%" flexWrap="wrap" pb={3}>
                        {
                            selectedChat.users.map(u => (
                                <UserBadgeItem key={u._id} user={u} handleFunction={() => handleRemove(u)} />
                            ))
                        }
                    </Box>
                    <FormControl display="flex">
                        <Input placeholder='Chat Name' onChange={e => setGroupChatName(e.target.value)} value={groupChatName} mb={3}/>
                        <Button variant="solid" colorScheme="teal" ml={1} isLoading={renameLoading} onClick={handleRename}>Update</Button>
                    </FormControl>
                    <FormControl>
                        <Input placeholder='Add Users' mb={1} onChange={e => searchUser(e.target.value)}/>
                    </FormControl>
                    { loading ? (
                        <Spinner size="lg" />
                    ) : (
                        searchResult?.map(result => (
                            <UserListItem key={result._id} user={result} handleFunction={() => handleAddUser(result)}/>
                        ))
                    )
                    }
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="red" onClick={() => handleRemove(user)}>
                        Leave Group
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
  )
}

export default UpdateGroupChatModal