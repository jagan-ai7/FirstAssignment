import { AuthProvider } from "./AuthContext";
import { CurrentUserProvider } from "./CurrentUserContext";
import { UsersProvider } from "./UsersContext";

export const ContextProvider = ({ children }) => {
  return (
    <AuthProvider>
      <CurrentUserProvider>
        <UsersProvider>{children}</UsersProvider>
      </CurrentUserProvider>
    </AuthProvider>
  );
};
