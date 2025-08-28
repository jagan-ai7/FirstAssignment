import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export const UserContext = createContext({
  user: null,
  token: "",
  users: [],
  setUser: () => {},
  setToken: () => {},
  setUsers: () => {},
});

export const UserProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => localStorage.getItem("token") || "");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch (error) {
      console.error("Invalid token in storage:", error);
      return null;
    }
  });

  // ✅ Sync token & user together
  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("token", newToken);
      try {
        const decoded = jwtDecode(newToken);
        setUser(decoded);
      } catch (err) {
        console.error("Failed to decode token:", err);
        setUser(null);
      }
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const fetchUsers = async () => {
      if (!token) {
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/users/get-users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data.data);
      } catch (error) {
        console.error(
          "Error fetching users:",
          error?.response?.data?.message || error.message
        );
      } finally {
        setLoading(false);
      }
    };

  // ✅ Fetch users when token changes
  useEffect(() => {
    fetchUsers();
  }, [token]);

  if (loading) return <div>Loading context...</div>;

  return (
    <UserContext.Provider
      value={{ user, token, users, setUser, setToken, setUsers }}
    >
      {children}
    </UserContext.Provider>
  );
};
