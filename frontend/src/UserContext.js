import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decodedUser = jwtDecode(storedToken);
                setUser(decodedUser);
                setToken(storedToken);
            } catch (error) {
                console.error('Invalid token:', error);
                setUser(null);
                setToken(null);
            }
        }
    }, [])
    return (
        <UserContext.Provider value={{ user, token, setUser, setToken }}>
            {children}
        </UserContext.Provider>
    );
};