import "./Side.css";
import { useContext } from "react";
import { UserContext } from "../UserContext";

export const Side = ({ friends=[], onSelectUser }) => {
  const { users } = useContext(UserContext);

  // Filter users to show only friends
  const friendsToShow = users.filter((user) => friends.includes(user.id));
  console.log('users-------',users);

  return (
    <>
      <div className="side-container">
        {friendsToShow.map((user, i) => (
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
