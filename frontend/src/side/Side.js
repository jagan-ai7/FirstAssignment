import "./Side.css";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export const Side = ({ onSelectUser }) => {
  const navigate = useNavigate();
  const { users } = useContext(UserContext);

  // const selectUser = async (id) => {
  //     navigate(`/chat/${id}`);
  // }

  return (
    <>
      <div className="side-container">
        {users.map((user, i) => (
          <div
            className="user-container"
            key={i}
            onClick={(e) => {
              e.preventDefault();
              onSelectUser(user.id);
            }}
          >
            <p className="user-name">
              {`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
            </p>
            <p className="user-email">{user.email}</p>
          </div>
        ))}
      </div>
    </>
  );
};
