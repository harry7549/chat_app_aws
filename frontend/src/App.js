import "./App.css";
import Homepage from "./Pages/HomePage";
import { Route } from "react-router-dom";
import Chatpage from "./Pages/ChatPage";

// import ChatProvider from "./context/ChatProvider";

function App() {
  return (
    <div className="App">
      {/* here without exact it renders homepage and chatpage. so to ensure only exact url works., the exact is used. */}
      <Route path="/" component={Homepage} exact />

      <Route path="/chat" component={Chatpage} />
    </div>
  );
}

export default App;
