import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export const UserContext = createContext({
  user: null,
  contextToken: "",
  users: [],
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/users/get-users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const users = response.data.data;
        setUsers(users);
      } catch (error) {
        if (error.response) {
          console.error(`Failed : ${error.response.data.message}`);
        } else {
          console.error("Unexpected error:", error.message);
        }
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        setUser(decodedUser);
        setToken(storedToken);
      } catch (error) {
        console.error("Invalid token:", error);
        setUser(null);
        setToken(null);
      }
    }
  }, []);
  return (
    <UserContext.Provider
      value={{ user, token, users, setUser, setToken, setUsers }}
    >
      {children}
    </UserContext.Provider>
  );
};
