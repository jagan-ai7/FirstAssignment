import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./Chat.css";
import { UserContext } from "../UserContext.js";

const socket = io("http://localhost:5000");

export const Chat = ({ selectedId }) => {
  const { user, token } = useContext(UserContext);
  // const token = localStorage.getItem('token');
  // const { id } = useParams();
  const id = selectedId;
  const userId = user?.userId;
  const [name, setName] = useState();
  // const userId = localStorage.getItem('id');

  const [toId, setToId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  console.log("id------", id);
  const hasLoggedIn = useRef(false);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/users/get-user/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const resData = response.data.data;
        setToId(resData.id);
        setName(`${resData.firstName} ${resData.lastName}`);
      } catch (error) {
        if (error.response) {
          console.error(`Failed : ${error.response.data.message}`);
        } else {
          console.error("Unexpected error:", error.message);
        }
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (userId && !hasLoggedIn.current) {
      socket.emit("login", userId);
      hasLoggedIn.current = true;
    }
  }, [userId]);

  // Helper to add message to the correct chat in state
  const addMessage = (newMsg) => {
    // Determine chat partner's id (the "other" user in conversation)
    const otherUserId = newMsg.from === userId ? newMsg.to : newMsg.from;
    setMessages((prev) => {
      const userMessages = prev[otherUserId] || [];
      return {
        ...prev,
        [otherUserId]: [...userMessages, newMsg],
      };
    });
  };

  // Listen for incoming private messages
  useEffect(() => {
    socket.on("private_message", (newMsg) => {
      addMessage(newMsg);
    });

    // Listen for updated online users list (new addition)
    socket.on("users_update", (onlineUsers) => {
      console.log("Online users:", onlineUsers);
      // Optionally, update state here if you want to display online users
    });

    return () => {
      socket.off("private_message");
      socket.off("users_update");
    };
  }, []);

  const sendMessage = () => {
    if (userId && toId && message.trim()) {
      const newMsg = { from: userId, to: toId, message: message.trim() };
      socket.emit("private_message", newMsg);
      addMessage(newMsg);
      setMessage("");
    }
  };

  const chatMessages = messages[toId] || [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: "9",
        gap: "2px",
        overflow: "hidden",
      }}
    >
      {selectedId ? (
        <>
          <div style={{ display: "flex" }}>
            <h2
              style={{
                marginLeft: "30px",
                fontFamily: "Times New Roman, Times, serif",
                fontSize: "20Spx",
              }}
            >
              {name}
            </h2>
          </div>
          <hr style={{ width: "94%" }} />
          <div
            style={{
              flexGrow: 9,
              padding: "20px",
              overflowY: "auto",
              margin: "0px 10px",
            }}
          >
            {chatMessages.map((msg, i) => {
              const isSender = msg.from === userId;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: isSender ? "flex-end" : "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: isSender ? "#4A90E2" : "#d2d6da",
                      color: isSender ? "#FFFFFF" : "#161f28",
                      padding: "8px 12px",
                      borderRadius: isSender
                        ? "15px 0 15px 15px"
                        : "0 15px 15px 15px",
                      maxWidth: "70%",
                      wordWrap: "break-word",
                      display: "inline-block",
                      textAlign: isSender ? "right" : "left",
                      boxSizing: "border-box",
                      whiteSpace: "pre-wrap",
                      margin: "8px 0",
                    }}
                  >
                    <span>{msg.message}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <hr style={{ width: "94%" }} />
          <div style={{ display: "flex", gap: "2px", marginBottom: "10px" }}>
            <input
              className="chat-input"
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Type a message "
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              value={message}
            />
            <button
              className="chat-btn"
              onClick={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <img
                src="/images/send-button1.png"
                alt="Send"
                style={{ width: "30px", height: "25px" }}
              />
            </button>
          </div>
        </>
      ) : (
        <div style={{ margin: "auto" }}>Select a user to start chatting</div>
      )}
    </div>
  );
};
