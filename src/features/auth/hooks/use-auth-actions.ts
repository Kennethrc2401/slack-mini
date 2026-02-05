"use client";

import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { signOut as nextAuthSignOut } from "next-auth/react";
import { useAuthContext } from "../auth-context";

export const useAuthActions = () => {
    const signUpMutation = useMutation(api.authActions.signUpWithPassword);
    const signInMutation = useMutation(api.authActions.signInWithPassword);
    const router = useRouter();
    const { signIn: contextSignIn, signUp: contextSignUp, signOut: contextSignOut } = useAuthContext();

    const signIn = useCallback(async (
        provider: string,
        credentials?: { email: string; password: string; name?: string; flow: string }
    ) => {
        try {
            if (provider === "password" && credentials) {
                if (credentials.flow === "signUp") {
                    // Call backend mutation
                    try {
                        await signUpMutation({
                            email: credentials.email,
                            password: credentials.password,
                            name: credentials.name || credentials.email.split("@")[0],
                        });
                    } catch (e) {
                        // If user already exists, just sign in
                        console.log("Sign up failed, attempting sign in...", e);
                    }
                    
                    // Update local auth state
                    await contextSignUp(
                        credentials.email, 
                        credentials.password,
                        credentials.name || credentials.email.split("@")[0]
                    );
                } else {
                    // Sign in
                    try {
                        await signInMutation({
                            email: credentials.email,
                            password: credentials.password,
                        });
                    } catch (e) {
                        console.log("Sign in failed:", e);
                    }
                    
                    // Update local auth state
                    await contextSignIn(credentials.email, credentials.password);
                }
                
                // Redirect to home, which will show workspaces
                router.push("/");
            } else if (provider === "github" || provider === "google") {
                // For OAuth providers, redirect to Auth.js sign-in endpoint
                const callbackUrl = `${window.location.origin}/auth`;
                window.location.href = `/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
            } else {
                throw new Error(`Provider ${provider} not yet implemented`);
            }
        } catch (error) {
            throw error;
        }
    }, [signUpMutation, signInMutation, router, contextSignIn, contextSignUp]);

    const signOut = useCallback(async () => {
        contextSignOut();
        // Use Next-Auth signOut with callbackUrl to properly clear session
        await nextAuthSignOut({ 
            callbackUrl: "/auth?logout=true",
            redirect: true 
        });
    }, [contextSignOut]);

    return {
        signIn,
        signOut,
    };
};






