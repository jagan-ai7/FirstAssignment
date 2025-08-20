import axios from "axios";
import { useContext, useEffect, useState } from "react";
import "../register/Register.css";
import { Link } from "react-router-dom";
import Popup from "reactjs-popup";
import { socket } from "../socket";
import { UserContext } from "../UserContext";
import {toast, ToastContainer} from "react-toastify";

export const Welcome = () => {
  const { users, token, user, setToken } = useContext(UserContext);
  const [userName, setUserName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/users/protected",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { firstName, lastName } = response.data.data;
      setUserName(`${firstName} ${lastName}`);
    } catch (error) {
      console.error("Access denied:", error.response?.data.error);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      socket.emit("login", user.userId);
    }
  }, [user]);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
  if (!user?.userId) return;
  console.log("📡 Listening for socket events...");

  socket.on("friend_request_received", async ({ fromUserId }) => {
     console.log("📥 Friend request received from:", fromUserId);
    setIncomingRequests((prev) =>
      prev.includes(fromUserId) ? prev : [...prev, fromUserId]
    );
  });

  socket.on("friend_request_accepted", async ({ userId }) => {
    console.log("✅ Friend request accepted by:", userId);
    toast.success(`Friend request accepted by user ${userId}`);
    setSentRequests((prev) => prev.filter((id) => id !== userId));
    setFriendsList((prev) => [...prev, userId]);
  });

  socket.on("friend_request_denied", async ({ userId }) => {
    console.log("🚫 Friend request denied by:", userId);
    toast.error(`Friend request denied by user ${userId}`);
    setSentRequests((prev) => prev.filter((id) => id !== userId));
  });

  return () => {
    socket.off("friend_request_received");
    socket.off("friend_request_accepted");
    socket.off("friend_request_denied");
  };
}, [user]);



  const addFriend = (toUserId) => {
    if (!user?.userId) return toast.info("Please login first.");
    if (sentRequests.includes(toUserId) || friendsList.includes(toUserId))
      return;
    socket.emit("send_friend_request", { fromUserId: user.userId, toUserId });
    setSentRequests((prev) => [...prev, toUserId]);
    toast.success("Friend request sent!");
  };

  const acceptRequest = (fromUserId) => {
    socket.emit("accept_friend_request", { fromUserId, toUserId: user.userId });
    setIncomingRequests((prev) => prev.filter((id) => id !== fromUserId));
    setFriendsList((prev) => [...prev, fromUserId]);
  };

  const denyRequest = (fromUserId) => {
    socket.emit("deny_friend_request", { fromUserId, toUserId: user.userId });
    setIncomingRequests((prev) => prev.filter((id) => id !== fromUserId));
  };

  return (
    <>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#032d5d",
          color: "white",
          border: "1px solid black",
          borderRadius: "0 0 10px 10px",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            marginLeft: "40px",
            fontFamily: "Times New Roman, Times, serif",
            alignSelf: "center",
          }}
        >
          {userName}
        </h2>

        {/* Add Friend Button */}
        <div
          style={{
            marginLeft: "auto",
            marginRight: "50px",
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          <button className="add-friend" onClick={() => setIsSidebarOpen(true)}>
            Add Friend
          </button>
        </div>

        {/* Menu Popup */}
        <Popup
          trigger={<button className="popup-btn">Menu</button>}
          contentStyle={{
            display: "flex",
            flexDirection: "column",
            border: "none",
            borderRadius: "5px",
          }}
          overlayStyle={{ background: "rgba(0,0,0,0.4)" }}
        >
          <span className="popup-itm">
            <Link className="linkfp" to={"/changepassword"}>
              Change Password
            </Link>
          </span>
          <span className="popup-itm">
            <Link
              className="linkfp"
              to={"/login"}
              onClick={() => {
                localStorage.clear();
                setToken("");
              }}
            >
              Logout
            </Link>
          </span>
        </Popup>
      </div>

      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "300px",
          backgroundColor: "#fff",
          boxShadow: "-2px 0 5px rgba(0, 0, 0, 0.3)",
          padding: "20px",
          transition: "transform 0.3s ease-in-out",
          transform: isSidebarOpen ? "translateX(0%)" : "translateX(100%)",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            fontSize: "20px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          ✖
        </button>

        <h3>Add a Friend</h3>
        {/* Incoming Friend Requests */}
        {/* {incomingRequests.length > 0 && (
          <div
            style={{
              backgroundColor: "#f4f4f4",
              padding: "10px",
              borderRadius: "5px",
              maxWidth: "300px",
              margin: "10px",
            }}
          >
            <h4>Incoming Friend Requests</h4>
            {incomingRequests.map((reqId) => {
              const u = users.find((u) => u.id === reqId);
              return (
                <div
                  key={reqId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #ccc",
                    paddingBottom: "4px",
                    marginBottom: "8px",
                  }}
                >
                  <span>{`${u?.firstName || "User"} ${
                    u?.lastName || ""
                  }`}</span>
                  <div>
                    <button
                      onClick={() => acceptRequest(reqId)}
                      style={{ marginRight: "8px" }}
                    >
                      Accept
                    </button>
                    <button onClick={() => denyRequest(reqId)}>Deny</button>
                  </div>
                </div>
              );
            })}
          </div>
        )} */}
        {users
          .filter((u) => u.id !== user?.userId)
          .map((u) => {
            const isIncoming = incomingRequests.includes(u.id);
            const isSent = sentRequests.includes(u.id);
            const isFriend = friendsList.includes(u.id);

            return (
              <div
                key={u.id}
                style={{
                  borderBottom: "1px solid black",
                  padding: "0 5px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p
                  style={{ fontWeight: "bold" }}
                >{`${u.firstName} ${u.lastName}`}</p>
                {isFriend ? (
                  <span style={{ color: "green" }}>Friend</span>
                ) : isIncoming ? (
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button onClick={() => acceptRequest(u.id)}>Accept</button>
                    <button onClick={() => denyRequest(u.id)}>Deny</button>
                  </div>
                ) : isSent ? (
                  <button disabled style={{ opacity: 0.6 }}>
                    Requested
                  </button>
                ) : (
                  <button onClick={() => addFriend(u.id)}>Add</button>
                )}
              </div>
            );
          })}
      </div>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 999,
          }}
        />
      )}
      <ToastContainer/>
    </>
  );
};
