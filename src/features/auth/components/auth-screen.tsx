"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SignInFlow } from "../types";
import { SignInCard } from "@/components/sign-in-card";
import { SignUpCard } from "@/components/sign-up-card";
import { useAuthContext } from "../auth-context";
import { useSession } from "next-auth/react";

export const AuthScreen = () => {
    const [state, setState] = useState<SignInFlow>("signIn");
    const router = useRouter();
    const { userId, signInWithOAuth } = useAuthContext();
    const { data: session, status } = useSession();
    const hasHydrated = useRef(false);
    const isLoggingOut = useRef(false);

    useEffect(() => {
        // Check if user just logged out via query param
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.has("logout")) {
                isLoggingOut.current = true;
                hasHydrated.current = false; // Reset hydration flag on logout
                // Clean up the URL
                window.history.replaceState({}, document.title, "/auth");
                // Reset the flag after 3 seconds to allow re-login
                const timer = setTimeout(() => {
                    isLoggingOut.current = false;
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    useEffect(() => {
        // If user is already logged in to Convex, redirect to workspace
        // BUT: Don't redirect if they're logging out
        if (isLoggingOut.current) {
            return;
        }
        
        if (userId) {
            router.push("/");
        }
    }, [router, userId]);

    useEffect(() => {
        // Reset hydration flag when session becomes unauthenticated
        if (status === "unauthenticated") {
            hasHydrated.current = false;
        }
    }, [status]);

    useEffect(() => {
        // Only sync once per session, and only if authenticated
        // Don't auto-login if they're logging out
        if (hasHydrated.current || isLoggingOut.current) return;
        
        if (status === "authenticated" && session?.user?.email && !userId) {
            hasHydrated.current = true;
            const email = session.user.email;
            const name = session.user.name || undefined;
            signInWithOAuth(email, name);
        }
    }, [status, session, userId, signInWithOAuth]);

    return (
        <div className="h-full flex items-center justify-center bg-[#5C3B58]">
            <div className="md:h-auto md:w-[420px]">
                {state === "signIn" ? <SignInCard setState={setState} /> : <SignUpCard setState={setState} />}
            </div>
        </div>
    );
};
