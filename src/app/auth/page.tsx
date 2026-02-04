"use client";

import { SessionProvider } from "next-auth/react";
import { AuthScreen } from "@/features/auth/components/auth-screen";

const AuthPage = () => {
  return (
    <SessionProvider>
      <AuthScreen />
    </SessionProvider>
  );
};

export default AuthPage;