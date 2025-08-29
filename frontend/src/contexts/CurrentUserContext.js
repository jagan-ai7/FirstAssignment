import { createContext, useEffect, useState, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";

export const CurrentUserContext = createContext({
  user: null,
  setUser: () => {},
});

export const CurrentUserProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error("Failed to decode token:", err);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  return (
    <CurrentUserContext.Provider value={{ user, setUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
};
