import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthChange, signOut as doSignOut } from "@/lib/mockStore";

const AuthContext = createContext({ user: null, isAdmin: false, loading: false, signOut: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getAuth());
  useEffect(() => onAuthChange(setUser), []);
  const isAdmin = user?.role === "admin";
  return (
    <AuthContext.Provider value={{ user, profile: user, isAdmin, loading: false, signOut: doSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
