import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, useToast, VStack } from '@chakra-ui/react'
import React from 'react'
import { useState } from 'react'
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import dbCalls from '../../config/dbCalls';

function Signup() {
  const [show, setShow] = useState(false);  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfrimPassword] = useState("");
  const [pic, setPic] = useState("");
  const [loading, setLoading] = useState(false);

  const toast  = useToast();
  const history = useHistory();

  const submitHandler = async () => {
    setLoading(true);
    if(!name || !email || !password || !confirmPassword) {
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

    if(password !== confirmPassword) {
        toast({
            title: "Password do not match",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: 'bottom'
          })
          setLoading(false);
          return;
    }

    try {
        const config = {
            method: "post",
            url: "/api/user",
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                name,
                email,
                password,
                pic
            }
        };

        await axios(config)
        .then((result) => {
          console.log(result);
            localStorage.setItem("userInfo", JSON.stringify(result.data));
        })
        .catch((error) => {
          error = new Error();
        });

        toast({
            title: "Registration Successful",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: 'bottom'
        });

        

        setLoading(false);

        history.push('chat');
    } catch (error) {
        toast({
            title: error.response.data.message,
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: 'bottom'
          })
          setLoading(false);
    }
  }

  const postDetails = (pics) => {
      setLoading(true);

      if(pics === undefined) {
          toast({
            title: "Please select an image",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: 'bottom'
          })
          return;
      }

      if(pics.type === "image/jpeg" || pics.type === "image/png"){
           const data = new FormData();

           data.append("file", pics);
           data.append("upload_preset", "mernchat");
           data.append("cloud_name", "dev-manish");

           try {
            fetch("https://api.cloudinary.com/v1_1/dev-manish/image/upload", {
                    method: 'post',
                    body: data
                }).then(res => res.json())
                .then(data => {
                    setPic(data.url.toString());
                    console.log(data.url);
                    setLoading(false);
                });
           } catch (error) {
               console.log(error);
           }
      }


  }

  return (
    <VStack spacing="5px">
        <FormControl id="first-name" isRequired>
            <FormLabel>Name:</FormLabel>
            <Input placeholder='Enter your name' onChange={e => setName(e.target.value)}/>
        </FormControl>
        <FormControl id="email" isRequired>
            <FormLabel>Email:</FormLabel>
            <Input placeholder='Enter your Email' onChange={e => setEmail(e.target.value)}/>
        </FormControl>
        <FormControl id="password" isRequired>
            <FormLabel>Password:</FormLabel>
            <InputGroup>
                <Input type={show ? "text" : "password"} placeholder='Enter your Password' onChange={e => setPassword(e.target.value)}/>
                <InputRightElement width={"4.5rem"}>
                    <Button h="1.75rem" size={"sm"} onClick={() => setShow(!show)}>
                        {show ? 'Hide' : 'Show'}
                    </Button>
                </InputRightElement>
            </InputGroup>
        </FormControl>
        <FormControl id="confirmPassword" isRequired>
            <FormLabel>Confirm Password:</FormLabel>
            <InputGroup>
                <Input type={show ? "text" : "password"} placeholder='Confirm your password' onChange={e => setConfrimPassword(e.target.value)}/>
                <InputRightElement width={"4.5rem"}>
                    <Button h="1.75rem" size={"sm"} onClick={() => setShow(!show)}>
                        {show ? 'Hide' : 'Show'}
                    </Button>
                </InputRightElement>
            </InputGroup>
        </FormControl>
        <FormControl id="pic">
            <FormLabel>Upload Profile Pic</FormLabel>
            <Input type="file" p={1.5} accept='image/*' onChange={e => postDetails(e.target.files[0])} />
        </FormControl>

        <Button colorScheme="blue" width="100%" isLoading={loading} style={{marginTop: 15}} onClick={submitHandler}>Sign Up</Button>
    </VStack>
  )
}

export default Signup