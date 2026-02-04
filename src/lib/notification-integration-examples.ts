/**
 * Example Integration Guide for Notifications
 * 
 * This file demonstrates how to integrate notifications with your message components.
 * Add this code to components that receive/display messages.
 */

// Example 1: In a channel/conversation page component
/*
import { useNotificationContext } from "@/components/notification-provider";
import { useEffect, useRef } from "react";

// Inside your component:
const { notifyNewMessage, notifyMention } = useNotificationContext();
const previousMessageCount = useRef(0);

// Watch for new messages
useEffect(() => {
    if (!messages) return;
    
    const newMessages = messages.filter((msg, index) => 
        index >= previousMessageCount.current
    );
    
    previousMessageCount.current = messages.length;
    
    // Notify for each new message
    newMessages.forEach((message) => {
        // Check if current user is mentioned
        const isMentioned = message.body?.includes(`@${currentMember?.user?.name}`);
        
        if (isMentioned) {
            notifyMention({
                messageId: message._id,
                senderName: message.member?.user?.name || "Someone",
                messageBody: message.body,
                channelName: channel?.name,
                channelId: channel?._id,
            });
        } else {
            notifyNewMessage({
                messageId: message._id,
                senderName: message.member?.user?.name || "Someone",
                senderId: message.memberId,
                messageBody: message.body,
                channelName: channel?.name,
                channelId: channel?._id,
            });
        }
    });
}, [messages, notifyNewMessage, notifyMention]);
*/

// Example 2: In message creation handler (play sound when sending)
/*
import { playSentSound } from "@/lib/sounds";

const handleSubmit = async (values: CreateMessageValues) => {
    await createMessage(values);
    playSentSound(); // Play confirmation sound
};
*/

// Example 3: Direct notification trigger
/*
import { showMessageNotification } from "@/lib/notifications";
import { playNotificationSound } from "@/lib/sounds";

// Trigger notification manually
showMessageNotification({
    senderName: "John Doe",
    messageBody: "Hey there!",
    channelName: "general",
    workspaceId: "workspace123",
    channelId: "channel456",
    onClick: () => {
        router.push(`/workspace/${workspaceId}/channel/${channelId}`);
    },
});

playNotificationSound();
*/

// Example 4: Check notification preferences before showing
/*
import { useGetMemberPreferences } from "@/features/userPreferences/api/useGetUserPreferences";

const { data: preferences } = useGetMemberPreferences({ workspaceId, memberId });

if (preferences?.notificationsEnabled) {
    // Show notification
}

if (preferences?.soundEnabled) {
    // Play sound
}
*/

export {};
