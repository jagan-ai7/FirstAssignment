import axios from "axios";
import { useContext, useEffect, useState } from "react";
import "../register/Register.css";
import { Link } from "react-router-dom";
import Popup from "reactjs-popup";
import { socket } from "../socket";
import { UserContext } from "../UserContext";
import { toast, ToastContainer } from "react-toastify";

export const Welcome = ({ updateFriendsList }) => {
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

  const fetchFriendsAndRequests = async () => {
    if (!user?.userId) return;

    try {
      // Fetch friends
      const friendsResponse = await axios.get(
        `http://localhost:5000/users/${user.userId}/friends`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFriendsList(friendsResponse.data.data || []);
      updateFriendsList(friendsResponse.data.data || []);

      // Fetch friend requests (incoming + sent)
      const requestsResponse = await axios.get(
        `http://localhost:5000/users/${user.userId}/friend-requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { incoming, sent } = requestsResponse.data.data || {
        incoming: [],
        sent: [],
      };
      setIncomingRequests(incoming);
      setSentRequests(sent);
    } catch (error) {
      console.error("Failed to fetch friends/requests", error);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchFriendsAndRequests();
      socket.emit("login", user.userId);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleError = ({ message }) => {
      toast.warn(message);
    };

    socket.on("error_message", handleError);

    return () => {
      socket.off("error_message", handleError);
    };
  }, []);

  useEffect(() => {
    if (!user?.userId) return;

    const handleRequestReceived = ({ fromUserId }) => {
      if (fromUserId === user.userId) return;
      setIncomingRequests((prev) =>
        prev.includes(fromUserId) ? prev : [...prev, fromUserId]
      );
    };

    const handleRequestSentConfirmation = ({ toUserId }) => {
      setSentRequests((prev) =>
        prev.includes(toUserId) ? prev : [...prev, toUserId]
      );
      toast.success("Friend request sent!");
    };

    const handleRequestAccepted = ({ userId }) => {
      const acceptedUser = users.find((u) => u.id === userId);
      const fullName = acceptedUser
        ? `${acceptedUser.firstName} ${acceptedUser.lastName}`
        : `User ${userId}`;

      toast.success(`${fullName} accepted your friend request.`);
      setSentRequests((prev) => prev.filter((id) => id !== userId));
      setFriendsList((prev) => {
        const newList = [...prev, userId];
        updateFriendsList(newList); // Notify parent of update
        return newList;
      });
    };

    const handleRequestAcceptedByYou = ({ userId }) => {
      const acceptedUser = users.find((u) => u.id === userId);
      const fullName = acceptedUser
        ? `${acceptedUser.firstName} ${acceptedUser.lastName}`
        : `User ${userId}`;

      toast.success(`${fullName} accepted your friend request.`);
      setIncomingRequests((prev) => prev.filter((id) => id !== userId));
      setFriendsList((prev) => {
        const newList = prev.includes(userId) ? prev : [...prev, userId];
        updateFriendsList(newList);
        return newList;
      });
    };

    const handleRequestDenied = ({ userId }) => {
      const deniedUser = users.find((u) => u.id === userId);
      const fullName = deniedUser
        ? `${deniedUser.firstName} ${deniedUser.lastName}`
        : `User ${userId}`;

      toast.error(`${fullName} denied your friend request.`);
      setSentRequests((prev) => prev.filter((id) => id !== userId));
    };

    socket.on("friend_request_sent", handleRequestSentConfirmation);
    socket.on("friend_request_received", handleRequestReceived);
    socket.on("friend_request_accepted", handleRequestAccepted);
    socket.on("friend_request_accepted_by_you", handleRequestAcceptedByYou);
    socket.on("friend_request_denied", handleRequestDenied);

    return () => {
      socket.off("friend_request_received", handleRequestReceived);
      socket.off("friend_request_accepted", handleRequestAccepted);
      socket.off("friend_request_accepted_by_you", handleRequestAcceptedByYou);
      socket.off("friend_request_denied", handleRequestDenied);
      socket.off("friend_request_sent", handleRequestSentConfirmation);
    };
  }, [user?.userId]);

  const addFriend = (toUserId) => {
    if (!user?.userId) return toast.info("Please login first.");

    if (sentRequests.includes(toUserId) || friendsList.includes(toUserId))
      return;

    socket.emit("send_friend_request", { fromUserId: user.userId, toUserId });
    setSentRequests((prev) => [...prev, toUserId]);
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
      <ToastContainer />
    </>
  );
};
