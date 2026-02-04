"use client";

import { useEffect, createContext, useContext, ReactNode } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetMemberPreferences } from "@/features/userPreferences/api/useGetUserPreferences";
import { useNotifications } from "@/hooks/use-notifications";

interface NotificationContextType {
    notifyNewMessage: (data: {
        messageId: string;
        senderName: string;
        senderId: string;
        messageBody: string;
        channelName?: string;
        channelId?: string;
    }) => void;
    notifyMention: (data: {
        messageId: string;
        senderName: string;
        messageBody: string;
        channelName?: string;
        channelId?: string;
    }) => void;
    clearNotificationHistory: () => void;
    canNotify: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotificationContext must be used within NotificationProvider");
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
    const workspaceId = useWorkspaceId();
    const { data: currentMember } = useCurrentMember({ workspaceId });
    const { data: preferences } = useGetMemberPreferences({
        workspaceId,
        memberId: currentMember?._id,
    });

    const {
        requestPermission,
        notifyNewMessage,
        notifyMention,
        clearNotificationHistory,
        canNotify,
    } = useNotifications({
        workspaceId,
        currentMemberId: currentMember?._id,
        notificationsEnabled: preferences?.notificationsEnabled ?? true,
        soundEnabled: preferences?.soundEnabled ?? true,
    });

    // Request notification permission on mount if notifications are enabled
    useEffect(() => {
        if (preferences?.notificationsEnabled) {
            requestPermission();
        }
    }, [preferences?.notificationsEnabled, requestPermission]);

    return (
        <NotificationContext.Provider
            value={{
                notifyNewMessage,
                notifyMention,
                clearNotificationHistory,
                canNotify,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
