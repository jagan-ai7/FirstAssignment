import "./Side.css";
import { useContext } from "react";
import { UsersContext } from "../contexts/UsersContext";

export const Side = ({ friends = [], onSelectUser }) => {
  const { users } = useContext(UsersContext);

  // Filter users to show only friends
  const friendsToShow = users.filter((user) => friends.includes(user.id));

  return (
    <>
      <div
        className="bg-white border-end shadow-sm p-4 overflow-auto"
        style={{ width: "25%" }}
      >
        {friendsToShow.map((user, i) => (
          <div
            className="user-container p-2 bg-primary bg-opacity-10 rounded shadow-sm hover-bg-primary"
            key={i}
            onClick={(e) => {
              e.preventDefault();
              onSelectUser(user.id);
            }}
          >
            <p className="fw-semibold text-dark">
              {`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
            </p>
            <p className="small text-secondary">{user.email}</p>
          </div>
        ))}
      </div>
    </>
  );
};
