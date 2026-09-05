import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [userType, setUserType] = useState(
    localStorage.getItem("userType") || "EMPLOYEE"
  );
  const [loading, setLoading] = useState(false);

  const login = (newToken, userData, type = "EMPLOYEE") => {
    localStorage.setItem("token", newToken);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
    localStorage.setItem("userType", type);

    setToken(newToken);
    setUser(userData);
    setUserType(type);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("temp_password_token");

    setToken("");
    setUser(null);
    setUserType("EMPLOYEE");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        userType,
        isAuthenticated: !!token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
