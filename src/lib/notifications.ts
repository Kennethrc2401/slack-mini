/**
 * Browser Notification Utilities
 * Handles desktop notifications and permission management
 */

export type NotificationPermissionStatus = "granted" | "denied" | "default";

/**
 * Request notification permission from the browser
 */
export const requestNotificationPermission = async (): Promise<NotificationPermissionStatus> => {
    if (!("Notification" in window)) {
        console.warn("This browser does not support notifications");
        return "denied";
    }

    try {
        const permission = await Notification.requestPermission();
        return permission as NotificationPermissionStatus;
    } catch (error) {
        console.error("Error requesting notification permission:", error);
        return "denied";
    }
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermissionStatus => {
    if (!("Notification" in window)) {
        return "denied";
    }
    return Notification.permission as NotificationPermissionStatus;
};

/**
 * Check if notifications are supported and permitted
 */
export const canShowNotifications = (): boolean => {
    return "Notification" in window && Notification.permission === "granted";
};

interface ShowNotificationOptions {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    data?: any;
    requireInteraction?: boolean;
    onClick?: () => void;
}

/**
 * Display a browser notification
 */
export const showNotification = ({
    title,
    body,
    icon = "/logo.png",
    tag,
    data,
    requireInteraction = false,
    onClick,
}: ShowNotificationOptions): Notification | null => {
    if (!canShowNotifications()) {
        console.warn("Notifications not available");
        return null;
    }

    try {
        const notification = new Notification(title, {
            body,
            icon,
            tag,
            data,
            requireInteraction,
            badge: "/logo.png",
        });

        if (onClick) {
            notification.onclick = () => {
                onClick();
                notification.close();
            };
        }

        // Auto-close after 5 seconds if not requiring interaction
        if (!requireInteraction) {
            setTimeout(() => {
                notification.close();
            }, 5000);
        }

        return notification;
    } catch (error) {
        console.error("Error showing notification:", error);
        return null;
    }
};

/**
 * Show a notification for a new message
 */
export const showMessageNotification = ({
    senderName,
    messageBody,
    channelName,
    workspaceId,
    channelId,
    onClick,
}: {
    senderName: string;
    messageBody: string;
    channelName?: string;
    workspaceId: string;
    channelId?: string;
    onClick?: () => void;
}) => {
    const title = channelName ? `${senderName} in #${channelName}` : senderName;
    const body = messageBody.length > 100 ? `${messageBody.slice(0, 100)}...` : messageBody;

    return showNotification({
        title,
        body,
        tag: `message-${channelId || "dm"}`,
        data: { workspaceId, channelId },
        onClick,
    });
};

/**
 * Show a notification for a mention
 */
export const showMentionNotification = ({
    senderName,
    messageBody,
    channelName,
    workspaceId,
    channelId,
    onClick,
}: {
    senderName: string;
    messageBody: string;
    channelName?: string;
    workspaceId: string;
    channelId?: string;
    onClick?: () => void;
}) => {
    const title = `${senderName} mentioned you${channelName ? ` in #${channelName}` : ""}`;
    const body = messageBody.length > 100 ? `${messageBody.slice(0, 100)}...` : messageBody;

    return showNotification({
        title,
        body,
        tag: `mention-${channelId || "dm"}`,
        data: { workspaceId, channelId, type: "mention" },
        requireInteraction: true,
        onClick,
    });
};
