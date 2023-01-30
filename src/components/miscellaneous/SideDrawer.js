import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Text, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import {BellIcon ,ChevronDownIcon} from '@chakra-ui/icons';
import { ChatState } from '../../context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Loading from '../Loading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/utilFunc';

const SideDrawer = () => {
    const [search,setSearch] = useState("");
    const [searchResult, setSearchResult] = useState();
    const [loading,setLoading] = useState(false);
    const [loadingChat,setLoadingChat] = useState();
    const {selectedChat ,setSelectedChat, setChats, chats, notifications, setNotifications} = ChatState();

    const {isOpen, onOpen, onClose} = useDisclosure();

    const {user} = ChatState();
    const history = useHistory();
    const toast = useToast();

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");

        history.push("/");
    }

    const handleSearch = async () => {
        console.log("demo");
        if(!search) {
            toast({
                title: "Please enter something in search",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-left"
            })
            return;
        }

        try{
            setLoading(true);

            const config = {
                url: `/api/user?search=${search}`,
                method: 'get',
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            }

            await axios(config).then(result => {setSearchResult(result.data); setLoading(false)})
        } catch(error) {
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

    const accessChat = async (userId) => {
        try{
            setLoadingChat(true);

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                url: "/api/chat",
                method: "post",
                data: { userId }   
            }

            await axios(config).then(result => {
                if(!chats.find(c => c._id === result.data._id)) setChats([result.data, ...chats]);
                setSelectedChat(result.data);
                setLoadingChat(false);
                onClose();
            })
        } catch (err) {
            toast({
                title: "Error occured",
                description: err.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left"
            })
            return;
        }
    }

  return (
    <>
        <Box display="flex" justifyContent="space-between" alignItems="center" bg="white" w="100%" p="5px 10px 5px 10px" borderWidth="5px">
            <Tooltip label="Search Users to chat" hasArrow placement='bottom-end'>
                <Button variant="ghost" onClick={onOpen}>
                    <i className='fas fa-search'></i>
                    <Text d={{base: "none", md: "flex"}} px="4">Search User</Text>
                </Button>
            </Tooltip>

            <Text fontSize="2xl" fontFamily="Work sans">Mern Chat</Text>

            <div>
                <Menu>
                    <MenuButton position="relative" padding={1}>
                        {notifications.length ? <span style={{ position: "absolute",border: "1px solid red", background: "red", color: "white", borderRadius: "25px", width: "20px", height: "20px", padding: "0", fontSize: "12px", right: 0}}>{notifications.length}</span> : <></>}
                        <BellIcon fontSize="2xl" m={1}/>
                    </MenuButton>
                    <MenuList pl={2}>
                        {!notifications.length && "No New Messages" }
                        {notifications?.map(notification => (
                            <MenuItem key={notification._id} onClick={() => {
                                setSelectedChat(notification.chat);
                                setNotifications(notifications.filter(n => n !== notification))
                            }}> 
                                {notification.chat.isGroupChat ? `New message in ${notification.chat.chatName}` : `New message from ${getSender(user, notification.chat.users)}`}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                        <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic}/>
                    </MenuButton>
                    <MenuList>
                        <ProfileModal user={user}>
                            <MenuItem>My Profile</MenuItem>
                        </ProfileModal>
                        <MenuDivider/>
                        <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </div>
        </Box>

        <Drawer onClose={onClose} isOpen={isOpen} placement='left'>
            <DrawerOverlay />
            <DrawerContent>
                <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
                <DrawerBody>
                    <Box display="flex" pb={2}>
                        <Input placeholder='Search by name or email' mr={2} value={search} onChange={(e) => setSearch(e.target.value)} />
                        <Button onClick={handleSearch}>Go</Button>
                    </Box>

                    {loading ? (<Loading/>) : (
                        searchResult?.map((user) => (
                            <UserListItem
                                key={user._id}
                                user={user}
                                handleFunction={() => accessChat(user._id)}
                            />
                        ))
                    )}
                    {loadingChat && <Spinner ml="auto" display="flex"/>}
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    </>
  )
}

export default SideDrawer