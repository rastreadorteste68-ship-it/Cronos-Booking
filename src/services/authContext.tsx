import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from './storage';

interface AuthContextType {
  user: User | null;
  sendCode: (email: string) => Promise<string>;
  verifyCode: (email: string, code: string) => Promise<boolean>;
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

  const sendCode = async (email: string) => {
    setIsLoading(true);
    const code = await StorageService.requestMagicCode(email);
    setIsLoading(false);
    return code;
  };

  const verifyCode = async (email: string, code: string) => {
    setIsLoading(true);
    const foundUser = await StorageService.verifyMagicCode(email, code);
    if (foundUser) {
       setUser(foundUser);
       setIsLoading(false);
       return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    StorageService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, sendCode, verifyCode, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);