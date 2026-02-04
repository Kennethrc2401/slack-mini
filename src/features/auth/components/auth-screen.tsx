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

    useEffect(() => {
        // If user is already logged in to Convex, redirect to workspace
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
        if (hasHydrated.current) return;
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
