import React, { useEffect, useRef, useState } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBCardFooter,
  MDBCardHeader,
} from "mdb-react-ui-kit";
import { v4 as uuidv4 } from "uuid";
import socket from "../socket"; // adjust path
import { motion } from "framer-motion";
import "./Chat.css"; // custom styles

interface Message {
  content: string;
  id: string;
}

interface MessageGroup {
  id: string;
  author: "user" | "ai";
  messages: Message[];
}

const Chat: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [messageGroups, setMessageGroups] = useState<MessageGroup[]>([]);
  const messageGroupsRef = useRef<MessageGroup[]>([]);

  messageGroupsRef.current = messageGroups;

  const addNewMessage = (author: "user" | "ai", content: string) => {
    const groups = messageGroupsRef.current;
    if (groups.length > 0) {
      const last = groups[groups.length - 1];
      if (last.author === author) {
        last.messages.push({ content, id: uuidv4() });
        setMessageGroups([...groups.slice(0, -1), last]);
        return;
      }
    }
    setMessageGroups([
      ...messageGroups,
      { author, messages: [{ content, id: uuidv4() }], id: uuidv4() },
    ]);
  };

  const onSubmitMessage = () => {
    if (inputValue.trim() !== "") {
      socket.emit("message", inputValue);
      addNewMessage("user", inputValue);
      setInputValue("");
    }
  };

  useEffect(() => {
    socket.connect();
    const onResponse = (value: string) => addNewMessage("ai", value);
    socket.on("response", onResponse);
    return () => {
      socket.off("response", onResponse);
      socket.disconnect();
    };
  }, []);

  return (
    // No position:fixed or bottom: right: here.
    <motion.div
      className="chat-wrapper flex flex-col w-full h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MDBCard className="chat-card flex flex-col w-full h-full">
        <MDBCardHeader className="chat-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-black">Near AI Assistant</h5>
          {/* If you want a local close button, you can do so here. */}
        </MDBCardHeader>

        <MDBCardBody className="chat-body">
          {messageGroups.map((group) => (
            <div
              key={group.id}
              className={`d-flex mb-2 ${
                group.author === "user" ? "justify-content-end" : "justify-content-start"
              }`}
            >
              {group.author === "ai" && (
                <img
                  src="https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg"
                  alt="AI"
                  className="chat-avatar"
                />
              )}

              <div className="chat-messages-container">
                {group.messages.map((msg) => (
                  <motion.p
                    key={msg.id}
                    className={`chat-bubble ${
                      group.author === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {msg.content}
                  </motion.p>
                ))}
              </div>

              {group.author === "user" && (
                <img
                  src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp"
                  alt="User"
                  className="chat-avatar"
                />
              )}
            </div>
          ))}
        </MDBCardBody>

        <MDBCardFooter className="chat-footer d-flex align-items-center">
          <img
            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp"
            alt="User"
            className="chat-avatar"
          />
          <input
            type="text"
            className="form-control form-control-lg ms-2"
            placeholder="Type message"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmitMessage();
            }}
          />
          <button className="btn btn-primary ms-2 text-[14px]" onClick={onSubmitMessage}>
            Send
          </button>
        </MDBCardFooter>
      </MDBCard>
    </motion.div>
  );
};

export default Chat;
