import { Modal, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, ModalBody, ModalFooter, Button, useDisclosure, useToast, FormControl, Input, Box } from '@chakra-ui/react';
import axios from 'axios';
import React, { useState } from 'react'
import { ChatState } from '../../context/ChatProvider';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import UserListItem from '../UserAvatar/UserListItem';

function GroupChatModal({children}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const toast = useToast();

    const { user, setChats, chats } = ChatState();

    const handleSearch = async (query) => {
        setSearch(query);
        if(!query) {
            return;
        }

        try{
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            const {data} = await axios.get(`/api/user?search=${search}`, config);
            console.log(data);
            setLoading(false);
            setSearchResult(data);
        } catch(err) {
            toast({
                title: "Error occured",
                description: "Failed to load search user results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left"
            })
            return;
        }
    }

    const handleSubmit = async () => {
        if(!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the details",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top"
            })
            return;
        }

        console.log(groupChatName);
        console.log(selectedUsers);

        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                  
            }

            console.log(groupChatName);

            const {data} = await axios.post("/api/chat/group",{ 
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map(u => u._id)) 
            }, config);

            console.log(data);
            setChats([data, ...chats]);
            onClose();

            toast({
                title: "New Group Chat Created!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
        } catch(err) {
            toast({
                title: "Failed to create the chat",
                description: err.response.data,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
        }
    }

    const handleGroup = (user) => {
        if(selectedUsers.includes(user)) {
            toast({
                title: "User already added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top"
            });
            return;
        }

        setSelectedUsers([...selectedUsers, user]);
        console.log(selectedUsers);
    }

    const handleDelete = (userToDelete) => {
        console.log(userToDelete);
        const d = selectedUsers.filter((sel) => sel._id !== userToDelete._id);
        console.log(d);
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== userToDelete._id))
    }
  
  return (
      < >
        <span onClick={onOpen}>{children}</span>

        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader fontSize="35px" fontFamily="Work sans" display="flex" justifyContent="center">Create Group Chat</ModalHeader>
                <ModalCloseButton />
                <ModalBody display="flex" flexDirection="column" alignItems="center">
                    <FormControl>
                        <Input placeholder='Chat Name' mb={3} onChange={e => setGroupChatName(e.target.value)}/>
                    </FormControl>
                    <FormControl>
                        <Input placeholder='Add Users eg: John, Manish, Jane'
                        mb={1}
                        onChange={e => handleSearch(e.target.value)}
                        />
                    </FormControl>

                    <Box display="flex" w="100%" flexWrap="wrap">
                        {selectedUsers?.map(u => (
                            <UserBadgeItem user={u} key={u._id} handleFunction={() => handleDelete(u)} />
                        ))}
                    </Box>

                    {loading ? (
                        <div>Loading</div>
                    ) : (
                        searchResult.slice(0,4).map(user => (
                            <UserListItem key={user._id} user={user} handleFunction={() => handleGroup(user)}/>
                        ))
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button colorSchema="blue" onClick={handleSubmit}>
                        Create Chat
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
      </>
  )
}

export default GroupChatModal