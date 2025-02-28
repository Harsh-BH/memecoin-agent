import React, { useEffect, useRef, useState } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBCardFooter,
  MDBCardHeader,
  MDBCol,
  MDBContainer,
  MDBIcon,
  MDBRow,
} from "mdb-react-ui-kit";
import { v4 as uuidv4 } from "uuid";
import socket from "../socket"; // Adjust path based on your project

const Chat: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [messageGroups, setMessageGroups] = useState<MessageGroup[]>([]);
  const messageGroupsRef = useRef<MessageGroup[]>([]);
  messageGroupsRef.current = messageGroups;

  const addNewMessage = (author: "user" | "ai", content: string) => {
    const groups = messageGroupsRef.current;
    if (groups.length > 0) {
      const lastMessageGroup = { ...groups[groups.length - 1] };
      if (lastMessageGroup.author === author) {
        lastMessageGroup.messages.push({ content, id: uuidv4() });
        setMessageGroups((oldGroups) => [...oldGroups.slice(0, -1), lastMessageGroup]);
        return;
      }
    }
    setMessageGroups((oldMessageGroups) => [
      ...oldMessageGroups,
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

    const onResponse = (value: string) => {
      addNewMessage("ai", value);
    };

    socket.on("response", onResponse);

    return () => {
      socket.off("response", onResponse);
      socket.disconnect();
    };
  }, []);

  return (
    <MDBContainer
      fluid
      className="fixed bottom-0 right-0 w-96 z-50 bg-white shadow-xl border rounded-lg"
      style={{
        zIndex: 9999,
        position: "fixed",
        bottom: "20px",
        right: "20px",
        borderRadius: "15px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
        pointerEvents: "auto", // Ensure clicks work properly
      }}
    >
      <MDBRow className="d-flex justify-content-center">
        <MDBCol>
          <MDBCard id="chat2" style={{ borderRadius: "15px", zIndex: 9999 }}>
            <MDBCardHeader className="d-flex justify-between p-3 bg-gray-800 text-white">
              <h5 className="mb-0">Near AI Assistant</h5>
              <button
                className="text-white hover:text-red-400"
                onClick={() => setMessageGroups([])}
              >
                ✖
              </button>
            </MDBCardHeader>
            <div className="ScrollbarsCustom native trackYVisible trackXVisible">
              <div className="ScrollbarsCustom-Content">
                <MDBCardBody style={{ zIndex: 9999 }}>
                  {messageGroups.map((messageGroup) => (
                    <div
                      key={messageGroup.id}
                      className={`d-flex flex-row ${
                        messageGroup.author === "user"
                          ? "justify-content-end"
                          : "justify-content-start"
                      } mb-4`}
                      style={{ zIndex: 9999 }}
                    >
                      {messageGroup.author !== "user" && (
                        <img
                          src="https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg"
                          alt="avatar AI"
                          style={{ width: "45px", height: "100%", zIndex: 9999 }}
                        />
                      )}
                      <div>
                        {messageGroup.messages.map((message) => (
                          <p
                            key={message.id}
                            className={`small p-2 ${
                              messageGroup.author === "user"
                                ? "me-3 text-white rounded-3 bg-blue-500"
                                : "ms-3 rounded-3 bg-gray-200"
                            }`}
                            style={{
                              whiteSpace: "pre-line",
                              zIndex: 9999,
                            }}
                          >
                            {message.content}
                          </p>
                        ))}
                      </div>
                      {messageGroup.author === "user" && (
                        <img
                          src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp"
                          alt="avatar user"
                          style={{ width: "45px", height: "100%", zIndex: 9999 }}
                        />
                      )}
                    </div>
                  ))}
                </MDBCardBody>
              </div>
            </div>
            <MDBCardFooter className="text-muted d-flex justify-content-start align-items-center p-3">
              <img
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp"
                alt="avatar 3"
                style={{ width: "45px", height: "100%", zIndex: 9999 }}
              />
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Type message"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSubmitMessage();
                  }
                }}
                style={{ zIndex: 9999 }}
              />
              <button
                className="ms-3 btn btn-primary"
                onClick={onSubmitMessage}
                style={{ zIndex: 9999 }}
              >
                <MDBIcon fas icon="paper-plane" />
              </button>
            </MDBCardFooter>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default Chat;
