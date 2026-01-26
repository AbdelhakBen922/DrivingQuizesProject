import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import * as api from "../services/api";

export type UserType = "staff" | "student" | "guest" | null;

export interface AuthUser {
  type: UserType;
  id?: number;
  name?: string;
  email?: string;
  studentCode?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userType: UserType;
  isAuthenticated: boolean;
  isStaff: boolean;
  isStudent: boolean;
  isGuest: boolean;
  isLoading: boolean;
  setAuth: (user: AuthUser) => void;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  const userType = user?.type || null;
  const isAuthenticated = hasToken && !!user && user.type !== null;
  const isStaff = user?.type === "staff";
  const isStudent = user?.type === "student";
  const isGuest = user?.type === "guest";

  const setAuth = (authUser: AuthUser) => {
    setUser(authUser);
    setHasToken(!!localStorage.getItem("auth_token"));
    // Store user type in localStorage for persistence
    localStorage.setItem("userType", authUser.type || "");
    if (authUser.studentCode) {
      localStorage.setItem("studentCode", authUser.studentCode);
    }
  };

  const logout = () => {
    setUser(null);
    setHasToken(false);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("userType");
    localStorage.removeItem("studentCode");
    api.logout();
  };

  const checkAuth = () => {
    const token = localStorage.getItem("auth_token");
    setHasToken(!!token);
    const storedUserType = localStorage.getItem("userType") as UserType;
    const studentCode = localStorage.getItem("studentCode");

    if (token && storedUserType) {
      setUser({
        type: storedUserType,
        studentCode: studentCode || undefined,
      });
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    userType,
    isAuthenticated,
    isStaff,
    isStudent,
    isGuest,
    isLoading,
    setAuth,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
