import { createContext } from "react";

export type User = {
  id: string;
  username: string;
  email: string;
  bio?: string;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
});
