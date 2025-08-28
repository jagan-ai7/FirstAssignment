import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { socket } from "../socket.js";
import "./Chat.css";
import { UserContext } from "../UserContext.js";
import { toast } from "react-toastify";

export const Chat = ({ selectedId }) => {
  const { user, token } = useContext(UserContext);
  const userId = user?.userId?.toString();
  const id = selectedId?.toString(); // Ensure it's a string

  const [name, setName] = useState("");
  const [toId, setToId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [friends, setFriends] = useState([]); // Friends fetched from backend

  // Fetch friends
  useEffect(() => {
    if (!userId || !token) return;

    const fetchFriends = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/users/${userId}/friends`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const friendIds = response.data?.data || [];
        setFriends(friendIds.map(String)); // Ensure all IDs are strings
      } catch (error) {
        console.error("Failed to fetch friends:", error);
        setFriends([]);
      }
    };

    fetchFriends();
  }, [userId, token]);

  // Fetch selected user's details
  useEffect(() => {
    if (!id || !token) return;

    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/users/get-user/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const resData = response.data.data;
        setToId(resData.id?.toString());
        setName(`${resData.firstName} ${resData.lastName}`);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setToId("");
        setName("");
      }
    };

    fetchUser();
  }, [id, token]);

  // Fetch chat messages between users
  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId || !toId || !token) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/users/messages/${userId}/${toId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const loadedMessages = response.data.data.map((msg) => ({
          from: msg.fromId,
          to: msg.toId,
          message: msg.content, // message content
          type: msg.type || "text", // added to support type for images
          id: msg.id,
          timestamp: msg.createdAt,
        }));

        setMessages((prev) => ({
          ...prev,
          [toId]: loadedMessages,
        }));
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    fetchMessages();
  }, [userId, toId, token]);

  // Check if selected user is a friend
  const isFriend = friends.includes(id);

  // Add new message to chat state
  const addMessage = (newMsg) => {
    const from = newMsg.fromId || newMsg.from;
    const to = newMsg.toId || newMsg.to;
    const message = newMsg.message;
    const type = newMsg.type || "text";
    const id = newMsg.id || null;
    const timestamp = newMsg.timestamp || newMsg.createdAt || null;

    const otherUserId =
      from?.toString() === userId ? to?.toString() : from?.toString();

    setMessages((prev) => ({
      ...prev,
      [otherUserId]: [
        ...(prev[otherUserId] || []),
        { from, to, message, type, id, timestamp },
      ],
    }));
  };

  // Socket listeners
  useEffect(() => {
    const handlePrivateMessage = (newMsg) => {
      addMessage(newMsg);
    };

    const handleError = ({ message }) => {
      toast.error(message);
    };

    socket.on("private_message", handlePrivateMessage);
    socket.on("error_message", handleError);

    return () => {
      socket.off("private_message", handlePrivateMessage);
      socket.off("error_message", handleError);
    };
  }, [userId]);

  // Send a new text message
  const sendMessage = () => {
    if (!isFriend) {
      toast.error("You can only message your friends.");
      return;
    }

    if (userId && toId && message.trim()) {
      const newMsg = {
        fromId: userId,
        toId: toId,
        message: message.trim(),
        type: "text",
      };
      socket.emit("private_message", newMsg);
      // REMOVE addMessage(newMsg);
      setMessage("");
    }
  };

  // ======== NEW: Hidden file input for image upload =========
  // This input is triggered programmatically by sendImage()
  // Do not remove, otherwise image upload breaks
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !userId || !toId) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/users/upload", // Your image upload API route
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const imageUrl = response.data?.imageUrl;

      // In handleFileUpload after successful upload
      if (imageUrl) {
        const imageMsg = {
          fromId: userId,
          toId: toId,
          message: imageUrl,
          type: "image",
        };

        socket.emit("private_message", imageMsg);
      }
    } catch (err) {
      console.error("❌ Image upload failed:", err);
      toast.error("Failed to upload image.");
    }

    // Reset the file input value so same file can be selected again if needed
    e.target.value = null;
  };

  const sendImage = () => {
    if (!isFriend) {
      toast.error("❌ You can only send images to friends.");
      return;
    }
    const fileInput = document.getElementById("image-upload");
    fileInput.click();
  };
  // ======== END NEW code for image upload ================

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
      {/* Hidden file input for image upload */}
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      {selectedId ? (
        <>
          <div style={{ display: "flex" }}>
            <h2
              style={{
                marginLeft: "30px",
                fontFamily: "Times New Roman, Times, serif",
                fontSize: "20px",
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
              const isSender = msg.from?.toString() === userId;
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
                    {/* ===== Modified here to show image if type==="image" ===== */}
                    {msg.type === "image" ? (
                      <img
                        src={`http://localhost:5000${msg.message}`}
                        alt="Sent"
                        style={{ maxWidth: "200px", borderRadius: "10px" }}
                      />
                    ) : (
                      <span>{msg.message}</span>
                    )}
                    {/* ======================================================= */}
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
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              disabled={!isFriend}
            />
            {/* ===== New button to send image ===== */}
            <button
              className="image-btn"
              onClick={(e) => {
                e.preventDefault();
                sendImage();
              }}
              disabled={!isFriend}
            >
              <img
                src="/images/pictureSend.png"
                alt="ImgSend"
                style={{ width: "35px", height: "30px" }}
              />
            </button>

            <button
              className="chat-btn"
              onClick={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              disabled={!isFriend}
            >
              <img
                src="/images/send-button1.png"
                alt="Send"
                style={{ width: "30px", height: "25px" }}
              />
            </button>
          </div>
          {!isFriend && (
            <p style={{ color: "red", marginLeft: "30px" }}>
              You can only message your friends.
            </p>
          )}
        </>
      ) : (
        <div style={{ margin: "auto" }}>Select a user to start chatting</div>
      )}
    </div>
  );
};
