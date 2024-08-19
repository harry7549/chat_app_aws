import React, { useEffect, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import {
  FormControl,
  IconButton,
  Input,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import ScrollableChat from "./ScrollableChat";

import { Box, Text } from "@chakra-ui/layout";
import { getSender, getSenderFull } from "../config/ChatLogic";
import { ArrowBackIcon } from "@chakra-ui/icons";
import "./styles.css";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChat from "./miscellaneous/updateGroupChat";
import axios from "axios";
import io from "socket.io-client";
import animationData from "../typing.json";

import Lottie from "react-lottie";

const ENDPOINT = "http://localhost:5000";

var socket, selectedChatCompare;
function SingleChat({ fetchAgain, setFetchAgain }) {
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();
  const [Message, setMessage] = useState([]);
  const [loading, setloading] = useState(false);
  const [newMessage, setnewMessage] = useState();
  const toast = useToast();
  const [socketConnected, setsocketConnected] = useState();
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setloading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      setMessage(data);

      setloading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setnewMessage("");

        const { data } = await axios.post(
          "/api/message",
          { content: newMessage, chatId: selectedChat._id },
          config
        );
        console.log(data);

        socket.emit("new message", data);
        setMessage([...Message, data]);
      } catch (error) {
        toast({
          title: "error!!",
          description: "failed to send messages",
          status: "error",
          duration: 5000,
          isClosable: false,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setsocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  ///socket io work here it does realtime msg exchange
  useEffect(() => {
    socket.on("message received", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessage([...Message, newMessageRecieved]);
      }
    });
  });

  const TypingHandler = (e) => {
    setnewMessage(e.target.value);

    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);

      socket.emit("typing", selectedChat._id);
    }
    let LastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiffrence = timeNow - LastTypingTime;
      if (timeDiffrence >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  //socketio work . herer for connection

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100  %"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChat
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="90%"
            borderRadius="lg"
            overflowY="auto"
          >
            <div className="message">
              <ScrollableChat messages={Message} />
            </div>

            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
                color="red.500"
              />
            ) : (
              <>
                <div className="messages">
                  <ScrollableChat messages={Message} />
                </div>

                <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                  {isTyping ? (
                    <div>
                      <Lottie
                        options={defaultOptions}
                        height={50}
                        width={70}
                        style={{ marginBottom: 15, marginLeft: 0 }}
                      />
                    </div>
                  ) : (
                    <></>
                  )}

                  <Input
                    placeholder="enter a Message"
                    variant="filled"
                    bg="E0E0E0"
                    value={newMessage}
                    onChange={TypingHandler}
                  />
                </FormControl>
              </>
            )}
          </Box>
        </>
      ) : (
        <Box display="flex" alignItems justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            click on user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
}
export default SingleChat;
