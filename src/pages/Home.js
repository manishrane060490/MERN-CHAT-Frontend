import { Container, Box, Text, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import Login from '../components/authentication/Login'
import Signup from '../components/authentication/Signup'

function Home() {

    const history = useHistory();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userInfo"));

        if(user) {
            history.push('/chat');
        }
    },[history])
    
  return (
    <Container maxW="xl" centerContent>
        <Box
            d="flex"
            justifyContent="center"
            alignItems="center"
            p={3}
            bg={"white"}
            w="100%"
            m="40px 0 15px 0"
            borderRadius="lg"
            borderWidth="1px"
        >
            <Text fontSize="4xl">MERN chat app</Text>
        </Box>
        <Box bg={"white"} w="100%" p={4} borderRadius="lg" borderWidth="1px">
            <Tabs variant="soft-rounded">
                <TabList mb="1rem">
                    <Tab width="50%">Login</Tab>
                    <Tab width="50%">Sign Up</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <Login/>
                    </TabPanel>
                    <TabPanel>
                        <Signup/>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    </Container>
  )
}

export default Home