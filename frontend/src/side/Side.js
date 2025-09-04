import "./Side.css";
import { useContext } from "react";
import { UsersContext } from "../contexts/UsersContext";

export const Side = ({ friends = [], onSelectUser }) => {
  const { users } = useContext(UsersContext);

  // Filter users to show only friends
  const friendsToShow = users.filter((user) => friends.includes(user.id));

  return (
    <>
      <div className="bg-white border-end p-4 overflow-y-auto side-container">
        {friendsToShow.map((user, i) => (
          <div
            className=" flex flex-column align-items-start px-[10px] rounded-md hover:scale-[1.05] hover:bg-neutral-950 hover:text-neutral-50 active:scale-[0.98] ring shadow-xl ring-gray-300 hover:ring-0 cursor-pointer "
            key={i}
            onClick={(e) => {
              e.preventDefault();
              onSelectUser(user.id);
            }}
          >
            <p className="fw-semibold text-lg m-0 font-serif">
              {`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
            </p>
            <p className="small text-secondary">{user.email}</p>
          </div>
        ))}
      </div>
    </>
  );
};
