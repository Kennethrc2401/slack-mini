"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

interface AuthContextType {
  userId: string | null;
  email: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithOAuth: (email: string, name?: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const upsertUser = useMutation(api.users.upsert);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("auth-email");
    const storedUserId = localStorage.getItem("auth-user-id");
    if (storedEmail) {
      setEmail(storedEmail);
      setUserId(storedUserId);
    }
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const name = email.split("@")[0];
    
    const user = await upsertUser({
      userId: `user-${Date.now()}`,
      email,
      name,
    });

    if (!user) {
      throw new Error("Failed to create or retrieve user");
    }

    setEmail(email);
    setUserId(user._id);
    localStorage.setItem("auth-email", email);
    localStorage.setItem("auth-user-id", user._id);
  }, [upsertUser]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const user = await upsertUser({
      userId: `user-${Date.now()}`,
      email,
      name,
    });

    if (!user) {
      throw new Error("Failed to create or retrieve user");
    }

    setEmail(email);
    setUserId(user._id);
    localStorage.setItem("auth-email", email);
    localStorage.setItem("auth-user-id", user._id);
    localStorage.setItem("auth-name", name);
  }, [upsertUser]);

  const signInWithOAuth = useCallback(async (email: string, name?: string) => {
    const resolvedName = name || email.split("@")[0];

    const user = await upsertUser({
      userId: `user-${Date.now()}`,
      email,
      name: resolvedName,
    });

    if (!user) {
      throw new Error("Failed to create or retrieve user");
    }

    setEmail(email);
    setUserId(user._id);
    localStorage.setItem("auth-email", email);
    localStorage.setItem("auth-user-id", user._id);
    localStorage.setItem("auth-name", resolvedName);
  }, [upsertUser]);

  const signOut = useCallback(() => {
    setEmail(null);
    setUserId(null);
    localStorage.removeItem("auth-email");
    localStorage.removeItem("auth-user-id");
    localStorage.removeItem("auth-name");
  }, []);

  return (
    <AuthContext.Provider value={{ userId, email, isLoading, signIn, signUp, signInWithOAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}

