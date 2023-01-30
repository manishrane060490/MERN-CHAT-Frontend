import { FormControl, FormLabel, VStack, Input, InputGroup, InputRightElement, Button, useToast } from '@chakra-ui/react'
import React from 'react'
import { useState } from 'react'
import axios from 'axios';
import { useHistory } from 'react-router-dom';

function Login() {
  const [show, setShow] = useState(false);  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const toast  = useToast();
  const history = useHistory();

  const submitHandler = async () => {

    setLoading(true);
    if(!email || !password ) {
        toast({
            title: "Please fill all the fields",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: 'bottom'
          })
          setLoading(false);
          return;
    }

      const data = JSON.stringify({
        email,
        password
      });

      const config = {
        method: "post",
        url: "/api/user/login",
        headers: {
          "Content-Type": "application/json"
        },
        data: data
      };
  
      await axios(config)
        .then((result) => {
          console.log(result);
          localStorage.setItem('userInfo', JSON.stringify(result.data));
        })
        .catch((error) => {
          error = new Error();
        });

        setLoading(false);
        
        history.push('/chat');
  }

  return (
    <VStack spacing={"5px"}>
        <FormControl id="name" isRequired>
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={e => setEmail(e.target.value)}/>
        </FormControl>
        <FormControl id="password" isRequired>
            <FormLabel>Password:</FormLabel>
            <InputGroup>
                <Input type={show ? "text" : "password"} value={password} placeholder='Enter your Password' onChange={e => setPassword(e.target.value)}/>
                <InputRightElement width={"4.5rem"}>
                    <Button h="1.75rem" size={"sm"} onClick={() => setShow(!show)}>
                        {show ? 'Hide' : 'Show'}
                    </Button>
                </InputRightElement>
            </InputGroup>
        </FormControl>

        <Button colorScheme="blue" isLoading={loading} style={{marginTop: 15}} color="white" width="100%" onClick={submitHandler}>
            Login
        </Button>
        <Button colorScheme="red" style={{marginTop: 15}} color="white" width="100%" onClick={() => {setEmail('guest@guest.com'); setPassword('1234567')}}>
           Get Guest User Credentials
        </Button>
    </VStack>
  )
}

export default Login