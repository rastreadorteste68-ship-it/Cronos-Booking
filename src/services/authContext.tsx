import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from './storage';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = StorageService.getCurrentUser();
    if (stored) setUser(stored);
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    const foundUser = await StorageService.login(email);
    setUser(foundUser);
    setIsLoading(false);
    return !!foundUser;
  };

  const logout = () => {
    StorageService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);