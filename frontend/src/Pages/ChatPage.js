import { Box } from "@chakra-ui/layout";
import { ChatState } from "../context/ChatProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import ChatBox from "../components/ChatBox";

import MyChat from "../components/MyChat";

import { useEffect, useState } from "react";
const ChatPages = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  const [hasReloaded, setHasReloaded] = useState(false);

  // this is used. bcz screen at /chat was not rendring for very 1st time . in new browser
  // so this does hard refresh . auto refresh in 0.1 second,
  //and yes it solved the problem

  useEffect(() => {
    const hasReloadedBefore = localStorage.getItem("hasReloaded");

    if (!hasReloadedBefore) {
      setHasReloaded(true);
      localStorage.setItem("hasReloaded", "true");
      window.location.reload();
    }
  }, []);

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}

      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        {user && <MyChat fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default ChatPages;
