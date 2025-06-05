'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User, 
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { app } from '../firebaseConfig';

const AuthContext = createContext<{
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  loginWithGoogle: () => Promise<UserCredential>;
  loginWithEmail: (email: string, password: string) => Promise<UserCredential>;
  registerWithEmail: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}>({
  user: null,
  isLoading: true,
  isInitialized: false,
  loginWithGoogle: async () => {
    throw new Error('AuthContext not initialized');
  },
  loginWithEmail: async () => {
    throw new Error('AuthContext not initialized');
  },
  registerWithEmail: async () => {
    throw new Error('AuthContext not initialized');
  },
  logout: async () => {
    throw new Error('AuthContext not initialized');
  },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const auth = getAuth(app);
  useEffect(() => {
    console.log('AuthProvider initializing...');
    setIsLoading(true);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', { hasUser: !!user });
      setUser(user);
      setIsLoading(false);
      setIsInitialized(true);
    }, (error) => {
      console.error('Auth state change error:', error);
      setIsLoading(false);
      setIsInitialized(true);
    });

    // Set a timeout to ensure we mark as initialized even if Firebase is slow
    const timeoutId = setTimeout(() => {
      console.log('Auth initialization timeout reached');
      setIsInitialized(true);
      setIsLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [auth]);

  const loginWithGoogle = async (): Promise<UserCredential> => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      return await signInWithPopup(auth, provider);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    setIsLoading(true);
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    setIsLoading(true);
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isInitialized,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
