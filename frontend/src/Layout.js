import { useEffect, useState } from "react";
import { Chat } from "./side/Chat";
import { Side } from "./side/Side";
import { Welcome } from "./welcome/Welcome";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

export const Layout = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [friendsList, setFriendsList] = useState([]);
   const location = useLocation();
  const navigate = useNavigate();

  const updateFriendsList = (newFriends) => {
    setFriendsList(newFriends);
  };

  useEffect(() => {
    if (location.state?.showLoginToast) {
      toast.success(location.state.showLoginToast);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        height: "100vh",
      }}
    >
      <Welcome updateFriendsList={updateFriendsList} />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "2px",
          overflow: "hidden",
        }}
      >
        <Side friends={friendsList} onSelectUser={setSelectedId} />
        <Chat friendList={friendsList} selectedId={selectedId} />
      </div>
    </div>
  );
};
