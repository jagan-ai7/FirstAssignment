import { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { socket } from "../socket";

export const UsersContext = createContext({
  users: [],
  setUsers: () => {},
});

export const UsersProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    if (!token) {
      setUsers([]);
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:5000/users/get-users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data.data);
    } catch (error) {
      console.error(
        "Error fetching users:",
        error?.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  useEffect(() => {
    const handleUsersUpdate = (updatedUsers) => {
      console.log("🔁 Received users_updated:", updatedUsers);
      setUsers(updatedUsers);
    };

    socket.on("users_updated", handleUsersUpdate);

    return () => {
      socket.off("users_updated", handleUsersUpdate);
    };
  }, []);

  return (
    <UsersContext.Provider value={{ users, setUsers }}>
      {children}
    </UsersContext.Provider>
  );
};
