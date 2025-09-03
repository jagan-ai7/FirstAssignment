import axios from "axios";
import { useContext, useEffect, useState } from "react";
import "../register/Register.css";
import Popup from "reactjs-popup";
import { socket } from "../socket";
// import { UserContext } from "../UserContext";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import {
  increment,
  decrement,
  incrementByAmount,
} from "../redux/slice/counterSlice";
import { useNavigate } from "react-router-dom";
import { UsersContext } from "../contexts/UsersContext";
import { AuthContext } from "../contexts/AuthContext";
import { CurrentUserContext } from "../contexts/CurrentUserContext";

export const Welcome = ({ updateFriendsList, onSelectUser }) => {
  // const { users, token, user, setToken } = useContext(UserContext);
  const { token, setToken } = useContext(AuthContext);
  const { user } = useContext(CurrentUserContext);
  const { users } = useContext(UsersContext);
  const [userName, setUserName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  const navigate = useNavigate();

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

  const getUserFullName = (id) => {
    const userObj = users.find((u) => u.id === id);
    return userObj ? `${userObj.firstName} ${userObj.lastName}` : `User ${id}`;
  };

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
      toast.success(`${getUserFullName(userId)} accepted your friend request.`);
      setSentRequests((prev) => prev.filter((id) => id !== userId));
      setFriendsList((prev) => {
        const newList = [...prev, userId];
        return newList;
      });
    };

    const handleRequestAcceptedByYou = ({ userId }) => {
      setIncomingRequests((prev) => prev.filter((id) => id !== userId));
      setFriendsList((prev) => {
        const newList = prev.includes(userId) ? prev : [...prev, userId];
        return newList;
      });
    };

    const handleRequestDenied = ({ userId }) => {
      toast.error(`${getUserFullName(userId)} denied your friend request.`);
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
  }, [user?.userId, users]);

  useEffect(() => {
    if (updateFriendsList) {
      updateFriendsList(friendsList);
    }
  }, [friendsList]);

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

  const ChangePassword = () => {
    navigate("/changepassword");
  };

  const Logout = () => {
    localStorage.clear();
    setToken("");
    navigate("/login");
  };

  return (
    <>
      {/* HEADER */}
      <div className="navbar navbar-dark bg-dark px-4 d-flex justify-content-between align-items-center">
        <h2 className="navbar-brand">{userName}</h2>

        <div className="ms-auto me-5 my-auto">
          <button
            class="btn btn-outline-light btn-sm me-2 add-friend"
            onClick={() => setIsSidebarOpen(true)}
          >
            Add Friend
          </button>
        </div>

        <Popup
          trigger={
            <button className="btn btn-outline-light btn-sm popup-btn">
              Menu
            </button>
          }
          contentStyle={{
            borderRadius: "5px",
            width: "180px",
            display: "flex",
            flexDirection: "column",
            border: "none",
            overflow: "hidden",
          }}
          overlayStyle={{ background: "rgba(0,0,0,0.4)" }}
        >
          <span
            className="popup-itm"
            onClick={(e) => {
              e.preventDefault();
              ChangePassword();
            }}
          >
            Change Password
          </span>
          <span
            className="popup-itm"
            onClick={(e) => {
              e.preventDefault();
              Logout();
            }}
          >
            Logout
          </span>
        </Popup>
      </div>

      {/* Sidebar */}
      <div
        class="position-fixed top-0 end-0 vh-100 bg-white shadow p-3"
        style={{
          width: "380px",
          boxShadow: "-2px 0 5px rgba(0, 0, 0, 0.3)",
          transition: "transform 0.3s ease-in-out",
          transform: isSidebarOpen ? "translateX(0%)" : "translateX(100%)",
          zIndex: "1000",
        }}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          class="position-absolute top-0 end-0 bg-transparent border-0 fs-5"
        >
          ✖
        </button>

        <h3>Add a Friend</h3>
        <div className=" overflow-y-auto addfriend-container">
          {users
            .filter((u) => u.id !== user?.userId)
            .map((u) => {
              const isIncoming = incomingRequests.includes(u.id);
              const isSent = sentRequests.includes(u.id);
              const isFriend = friendsList.includes(u.id);

              return (
                <div
                  key={u.id}
                  class="d-flex justify-content-between align-items-center border-bottom p-2 mt-2"
                >
                  <p className="fw-bold m-0">{`${u.firstName} ${u.lastName}`}</p>
                  {isFriend ? (
                    // <span style={{ color: "green" }}>Friend</span>
                    <button
                      class="btn rounded border-0 border px-2 py-1 text-white message-btn"
                      style={{
                        backgroundColor: "#0158bb",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectUser(u.id);
                        setIsSidebarOpen(false);
                      }}
                    >
                      Message
                    </button>
                  ) : isIncoming ? (
                    <div class="d-flex gap-3">
                      <button
                        class="p-0 border-0 accept-deny"
                        onClick={() => acceptRequest(u.id)}
                      >
                        <img
                          src="/images/check-mark.png"
                          alt="ImgSend"
                          style={{ width: "20px", height: "20px" }}
                        />
                      </button>
                      <button
                        class="p-0 border-0 accept-deny"
                        onClick={() => denyRequest(u.id)}
                      >
                        <img
                          src="/images/cross.png"
                          alt="ImgSend"
                          style={{ width: "17px", height: "17px" }}
                        />
                      </button>
                    </div>
                  ) : isSent ? (
                    <button disabled style={{ opacity: 0.6 }}>
                      Requested
                    </button>
                  ) : (
                    <button
                      class="btn rounded border-0 border px-2 py-1 text-white message-btn"
                      style={{
                        backgroundColor: "#0158bb",
                      }}
                      onClick={() => addFriend(u.id)}
                    >
                      Add
                    </button>
                  )}
                </div>
              );
            })}
        </div>
        <h1>Count: {count}</h1>
        <button onClick={() => dispatch(increment())}>+</button>
        <button onClick={() => dispatch(decrement())}>-</button>
        <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
      </div>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ backgroundColor: "rgba(0,0,0,0.3)", zIndex: "999" }}
        />
      )}
    </>
  );
};
