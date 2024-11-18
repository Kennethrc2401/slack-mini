"use client";

import { useEffect, useState } from "react";

import { CreateChannelModal } from "@/features/channels/components/create-channel-modal";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import { UserPreferencesModal } from "@/features/userPreferences/components/user-preferences-modal";

export const Modals = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }
    
    return (
        <>
            <CreateChannelModal />
            <CreateWorkspaceModal />
            <UserPreferencesModal />
        </>
    );
};