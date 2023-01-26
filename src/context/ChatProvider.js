import React, { createContext, useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom';

const ChatContext = createContext();

function ChatProvider({children}) {

  const [user, setUser] = useState();
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const history = useHistory();

  useEffect(()=>{
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      setUser(userInfo);

      // console.log(userInfo);

      if(!userInfo) {
        console.log('entered')
        history.push('/')
      }
  },[history]);

  return (
    <ChatContext.Provider value={{user, setUser, selectedChat, setSelectedChat, chats, setChats}}>{children}</ChatContext.Provider>
  )
}

export const ChatState = () => {
    return useContext(ChatContext);
}

export default ChatProvider