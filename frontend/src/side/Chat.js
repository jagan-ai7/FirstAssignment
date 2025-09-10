import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { socket } from "../socket.js";
import "./Chat.css";
// import { UserContext } from "../UserContext.js";
import { toast } from "react-toastify";
import { AuthContext } from "../contexts/AuthContext.js";
import { CurrentUserContext } from "../contexts/CurrentUserContext.js";

export const Chat = ({ friendList = [], selectedId }) => {
  // const { user, token } = useContext(UserContext);
  const { token } = useContext(AuthContext);
  const { user } = useContext(CurrentUserContext);
  const userId = user?.userId?.toString();
  const id = selectedId?.toString(); // Ensure it's a string

  const [name, setName] = useState("");
  const [toId, setToId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [friends, setFriends] = useState([]); // Friends fetched from backend
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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

  useEffect(() => {
    setFriends(friendList.map(String)); // Ensure all IDs are strings
  }, [friendList]);

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

  useEffect(() => {
    scrollDown();
  }, [messages]);

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
      setMessage("");
    }
  };

  // ======== NEW: Hidden file input for image upload =========
  // This input is triggered programmatically by sendImage()
  // Do not remove, otherwise image upload breaks

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Reset input so the same file can be selected again later
    e.target.value = null;
  };

  const sendImageToServer = async () => {
    if (!selectedFile || !userId || !toId) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post(
        "http://localhost:5000/users/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageUrl = response.data?.imageUrl;

      if (imageUrl) {
        const imageMsg = {
          fromId: userId,
          toId: toId,
          message: imageUrl,
          type: "image",
        };

        socket.emit("private_message", imageMsg);
        toast.success("Image sent!");

        // Clear preview
        setPreviewUrl(null);
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error("Failed to upload image.");
    }
  };

  const cancelPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const scrollDown = () => {
    const container = document.getElementById("chat-container");
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
      });
    }
  };

  const sendImage = () => {
    if (!isFriend) {
      toast.error("You can only send images to friends.");
      return;
    }
    const fileInput = document.getElementById("image-upload");
    fileInput.click();
  };
  // ========== END NEW code for image upload ================

  const chatMessages = messages[toId] || [];

  return (
    <div className="flex-grow-1 d-flex flex-column">
      {/* Hidden file input for image upload */}
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        className=" d-none "
        onChange={handleFileUpload}
      />

      {selectedId ? (
        <>
          <div className="d-flex bg-light text-dark px-4 py-3 border-bottom">
            <h4 className="fw-semibold ms-3 font-serif">{name}</h4>
          </div>
          <div
            className="flex-grow-1 overflow-y-auto p-4 bg-white chat-container"
            id="chat-container"
          >
            {chatMessages.map((msg, i) => {
              const isSender = msg.from?.toString() === userId;
              return (
                <div
                  key={i}
                  className={` px-3 py-2 flex ${
                    isSender ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`text-white px-3 py-2 max-w-[70%] inline-block whitespace-pre-wrap break-words box-border my-2 ${
                      isSender
                        ? "bg-[#0069e5] text-right rounded-[15px_0_15px_15px]"
                        : "bg-[#808080] text-left rounded-[0_15px_15px_15px]"
                    }`}
                  >
                    {/* ===== Modified here to show image if type==="image" ===== */}
                    {msg.type === "image" ? (
                      <img
                        src={`http://localhost:5000${msg.message}`}
                        alt="Sent"
                        className=" w-max-[150px], rounded-[10px]"
                        onLoad={scrollDown}
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

          <hr />

          {previewUrl ? (
            <div className=" d-flex flex-column bg-primary bg-opacity-10 ms-auto rounded me-2 border w-[400px] ">
              <button
                className="cross-btn ms-auto m-2 w-[40px] h-[40px]"
                onClick={cancelPreview}
              >
                ✖
              </button>
              <img
                src={previewUrl}
                alt="Preview"
                className=" m-auto w-max-[300px] h-max-[300px] "
              />

              <div className=" bg-white border">
                <button
                  className="chat-btn m-2 w-[40px] h-[40px] "
                  onClick={sendImageToServer}
                >
                  <img
                    src="/images/send-button1.png"
                    alt="Send"
                    className=" w-[35px] h-[30px] "
                  />
                </button>
              </div>
            </div>
          ) : (
            <div className=" flex gap-1 mb-3 ">
              <input
                className="chat-input"
                type="text"
                onClick={() => {
                  scrollDown();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
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
                  className=" w-[40px] h-[35px]"
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
                  className=" w-[35px] h-[30px]"
                />
              </button>
            </div>
          )}

          {!isFriend && (
            <p className=" text-red-500 ms-[30px]">
              You can only message your friends.
            </p>
          )}
        </>
      ) : (
        <div className=" m-auto ">Select a user to start chatting</div>
      )}
    </div>
  );
};
