import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from './storage';
import { AuthService } from '../lib/authService';
import { auth } from '../lib/firebaseClient';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  sendLink: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth State from Storage
  useEffect(() => {
    const stored = StorageService.getCurrentUser();
    if (stored) setUser(stored);
    setIsLoading(false);
  }, []);

  // Listen to Firebase Auth Changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        // Sync with local Storage (create profile if new)
        const appUser = await StorageService.syncFirebaseUser(firebaseUser.email);
        setUser(appUser);
      } else {
        // Logged out
        if (!StorageService.getCurrentUser()) {
          setUser(null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const sendLink = async (email: string) => {
    setIsLoading(true);
    await AuthService.sendMagicLink(email);
    setIsLoading(false);
  };

  const logout = async () => {
    await auth.signOut();
    StorageService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, sendLink, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
