import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Id } from "../../convex/_generated/dataModel";
import { 
    showMessageNotification, 
    showMentionNotification,
    canShowNotifications,
    requestNotificationPermission 
} from "@/lib/notifications";
import { playNotificationSound, playMentionSound, setSoundEnabled } from "@/lib/sounds";

interface UseNotificationsProps {
    workspaceId: Id<"workspaces">;
    currentMemberId?: Id<"members">;
    notificationsEnabled?: boolean;
    soundEnabled?: boolean;
}

/**
 * Hook to handle notifications for new messages and mentions
 */
export const useNotifications = ({
    workspaceId,
    currentMemberId,
    notificationsEnabled = true,
    soundEnabled = true,
}: UseNotificationsProps) => {
    const router = useRouter();
    const previousMessagesRef = useRef<Set<string>>(new Set());

    // Update sound settings when preference changes
    useEffect(() => {
        setSoundEnabled(soundEnabled);
    }, [soundEnabled]);

    /**
     * Request notification permission if not already granted
     */
    const requestPermission = async () => {
        if (!notificationsEnabled) return;
        
        if (!canShowNotifications()) {
            await requestNotificationPermission();
        }
    };

    /**
     * Handle new message notification
     */
    const notifyNewMessage = ({
        messageId,
        senderName,
        senderId,
        messageBody,
        channelName,
        channelId,
    }: {
        messageId: string;
        senderName: string;
        senderId: string;
        messageBody: string;
        channelName?: string;
        channelId?: string;
    }) => {
        // Don't notify for own messages
        if (senderId === currentMemberId) return;

        // Don't notify if already seen this message
        if (previousMessagesRef.current.has(messageId)) return;
        previousMessagesRef.current.add(messageId);

        // Check if notifications are enabled
        if (!notificationsEnabled) return;

        // Play sound
        if (soundEnabled) {
            playNotificationSound();
        }

        // Show browser notification if permitted
        if (canShowNotifications()) {
            showMessageNotification({
                senderName,
                messageBody,
                channelName,
                workspaceId: workspaceId as string,
                channelId,
                onClick: () => {
                    if (channelId) {
                        router.push(`/workspace/${workspaceId}/channel/${channelId}`);
                    }
                    window.focus();
                },
            });
        }
    };

    /**
     * Handle mention notification
     */
    const notifyMention = ({
        messageId,
        senderName,
        messageBody,
        channelName,
        channelId,
    }: {
        messageId: string;
        senderName: string;
        messageBody: string;
        channelName?: string;
        channelId?: string;
    }) => {
        // Don't notify if already seen this message
        if (previousMessagesRef.current.has(`mention-${messageId}`)) return;
        previousMessagesRef.current.add(`mention-${messageId}`);

        // Check if notifications are enabled
        if (!notificationsEnabled) return;

        // Play mention sound (different from regular notification)
        if (soundEnabled) {
            playMentionSound();
        }

        // Show browser notification if permitted
        if (canShowNotifications()) {
            showMentionNotification({
                senderName,
                messageBody,
                channelName,
                workspaceId: workspaceId as string,
                channelId,
                onClick: () => {
                    if (channelId) {
                        router.push(`/workspace/${workspaceId}/channel/${channelId}`);
                    }
                    window.focus();
                },
            });
        }
    };

    /**
     * Clear notification history (call when switching channels)
     */
    const clearNotificationHistory = () => {
        previousMessagesRef.current.clear();
    };

    return {
        requestPermission,
        notifyNewMessage,
        notifyMention,
        clearNotificationHistory,
        canNotify: notificationsEnabled && canShowNotifications(),
    };
};
