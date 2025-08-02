import { createContext } from "react";

export type User = {
  id: string;
  username: string;
  email: string;
  bio?: string;
  createdAt?: string;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isUserLoading: boolean;
  isUserError: boolean;
  user: User | null;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAuthLoading: true,
  isUserLoading: true,
  isUserError: false,
  user: null,
});
