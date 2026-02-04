"use client";
import { Id } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader, Mail, Settings2, ArrowLeft, Bell, Shield, Palette, Eye, Volume2 } from "lucide-react";
import { requestNotificationPermission, getNotificationPermission, showMessageNotification } from "@/lib/notifications";
import { playNotificationSound, playMentionSound, playSentSound } from "@/lib/sounds";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useGetMember } from "@/features/members/api/use-get-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetMemberPreferences } from "@/features/userPreferences/api/useGetUserPreferences";
import { useUpdateMemberPreferences } from "@/features/userPreferences/api/useUpdateMemberPreferences";
import { useUpdateUserName } from "@/features/auth/api/use-update-user-name";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const SettingsPage = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const currentMember = useCurrentMember({ workspaceId });
    const { mutate: updatePreferences } = useUpdateMemberPreferences();
    const { mutate: updateUserName } = useUpdateUserName();
    
    const memberId = currentMember.data?._id as Id<"members">;

    const { data: member, isLoading: isLoadingMember } = useGetMember({ id: memberId });
    const { data: userPreferences, isLoading: isLoadingUserPreferences } = useGetMemberPreferences({
        workspaceId,
        memberId,
    });

    // Local state for settings
    const [displayName, setDisplayName] = useState<string>("");
    const [theme, setTheme] = useState<string>("");
    const [notifications, setNotifications] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [readReceipts, setReadReceipts] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<"granted" | "denied" | "default">("default");

    // Initialize settings from preferences
    useEffect(() => {
        if (member?.user?.name) {
            setDisplayName(member.user.name);
        }
        if (userPreferences?.theme) {
            setTheme(userPreferences.theme);
        }
        if (userPreferences?.notificationsEnabled !== undefined) {
            setNotifications(userPreferences.notificationsEnabled);
        }
        if (userPreferences?.soundEnabled !== undefined) {
            setSoundEnabled(userPreferences.soundEnabled);
        }
        if (userPreferences?.readReceipts !== undefined) {
            setReadReceipts(userPreferences.readReceipts);
        }
    }, [userPreferences, member]);

    // Check notification permission on mount
    useEffect(() => {
        setNotificationPermission(getNotificationPermission());
    }, []);

    const isLoading = isLoadingMember || isLoadingUserPreferences;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!member) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <AlertTriangle className="size-12 text-red-500" />
                <p className="text-lg font-semibold">Settings not available</p>
            </div>
        );
    }

    const avatarFallback = member?.user.name?.[0] ?? "S";

    const handleThemeChange = async (newTheme: string) => {
        setTheme(newTheme);
        setIsSaving(true);
        try {
            await updatePreferences(
                {
                    workspaceId,
                    memberId,
                    theme: newTheme as any,
                },
                {
                    onSuccess: () => {
                        toast.success("Theme updated successfully");
                    },
                    onError: (error) => {
                        toast.error("Failed to update theme");
                        console.error(error);
                    }
                }
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleNotificationsChange = async (enabled: boolean) => {
        // Request permission if enabling
        if (enabled && notificationPermission !== "granted") {
            const permission = await requestNotificationPermission();
            setNotificationPermission(permission);
            
            if (permission !== "granted") {
                toast.error("Notification permission denied. Please enable in browser settings.");
                return;
            }
        }

        setNotifications(enabled);
        setIsSaving(true);
        try {
            await updatePreferences(
                {
                    workspaceId,
                    memberId,
                    notificationsEnabled: enabled,
                },
                {
                    onSuccess: () => {
                        toast.success(enabled ? "Notifications enabled" : "Notifications disabled");
                    },
                    onError: (error) => {
                        toast.error("Failed to update notification settings");
                        console.error(error);
                        setNotifications(!enabled); // Revert on error
                    }
                }
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleSoundEnabledChange = async (enabled: boolean) => {
        setSoundEnabled(enabled);
        setIsSaving(true);
        try {
            await updatePreferences(
                {
                    workspaceId,
                    memberId,
                    soundEnabled: enabled,
                },
                {
                    onSuccess: () => {
                        toast.success(enabled ? "Sound enabled" : "Sound disabled");
                    },
                    onError: (error) => {
                        toast.error("Failed to update sound settings");
                        console.error(error);
                        setSoundEnabled(!enabled); // Revert on error
                    }
                }
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleReadReceiptsChange = async (enabled: boolean) => {
        setReadReceipts(enabled);
        setIsSaving(true);
        try {
            await updatePreferences(
                {
                    workspaceId,
                    memberId,
                    readReceipts: enabled,
                },
                {
                    onSuccess: () => {
                        toast.success(enabled ? "Read receipts enabled" : "Read receipts disabled");
                    },
                    onError: (error) => {
                        toast.error("Failed to update read receipts");
                        console.error(error);
                        setReadReceipts(!enabled); // Revert on error
                    }
                }
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestNotificationSound = () => {
        playNotificationSound();
        toast.success("Playing notification sound");
    };

    const handleTestMentionSound = () => {
        playMentionSound();
        toast.success("Playing mention sound");
    };

    const handleTestSentSound = () => {
        playSentSound();
        toast.success("Playing sent sound");
    };

    const handleTestBrowserNotification = () => {
        if (notificationPermission !== "granted") {
            toast.error("Please enable notifications first");
            return;
        }
        showMessageNotification({
            senderName: "Test User",
            messageBody: "This is a test notification!",
            channelName: "test-channel",
            workspaceId: workspaceId as string,
            onClick: () => {
                toast.success("Notification clicked!");
            },
        });
        toast.success("Test notification sent");
    };

    const handleDisplayNameChange = async (newName: string) => {
        if (!newName.trim()) {
            toast.error("Display name cannot be empty");
            return;
        }

        if (!member?.user?._id) {
            toast.error("User not found");
            return;
        }

        setIsSaving(true);
        try {
            await updateUserName(member.user._id, newName, {
                onSuccess: () => {
                    setDisplayName(newName);
                    toast.success("Display name updated successfully");
                },
                onError: (error) => {
                    toast.error("Failed to update display name");
                    console.error(error);
                    setDisplayName(member?.user?.name || "");
                }
            });
        } finally {
            setIsSaving(false);
        }
    };

    const themeOptions = [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "system", label: "System" },
        { value: "lgbtq", label: "LGBTQ+ 🌈" },
        { value: "trans", label: "Transgender 💙🩶💗" },
        { value: "lesbian", label: "Lesbian 🧡" },
        { value: "bi", label: "Bisexual 💙💜💗" },
        { value: "gay", label: "Gay 🏳️‍🌈" },
        { value: "queer", label: "Queer 🏳️‍⚧️" },
    ];

    return (
        <div className="h-full flex flex-col overflow-auto bg-white dark:bg-slate-950">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-3">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Settings2 className="size-6" />
                    Settings
                </h1>
            </div>

            {/* Settings Content */}
            <div className="flex-1 p-6 space-y-8">
                {/* Profile Section */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide">
                        Profile
                    </h2>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                        <Avatar className="h-16 w-16 border-2 border-slate-200 dark:border-slate-700">
                            <AvatarImage src={member?.user.image} alt={member?.user.name} />
                            <AvatarFallback className="bg-sky-500 text-white text-lg font-bold">
                                {avatarFallback}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{member?.user.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Mail className="size-4" />
                                {member?.user.email}
                            </p>
                            {member?.role === "admin" && (
                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-semibold">
                                    Workspace Administrator
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {/* Display Name Editor */}
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                        <label className="text-sm font-medium mb-2 block">Display Name</label>
                        <div className="flex gap-2">
                            <Input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your display name"
                                disabled={isSaving}
                                className="flex-1"
                            />
                            <Button
                                onClick={() => handleDisplayNameChange(displayName)}
                                disabled={isSaving || displayName === member?.user?.name}
                                variant="default"
                                size="sm"
                            >
                                {isSaving ? <Loader className="size-4 animate-spin" /> : "Save"}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Change how your name appears across the workspace
                        </p>
                    </div>
                </section>

                <Separator />

                {/* Appearance Settings */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Palette className="size-4" />
                        Appearance
                    </h2>
                    <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                            <label className="text-sm font-medium mb-2 block">Theme</label>
                            <Select value={theme} onValueChange={handleThemeChange} disabled={isSaving}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    {themeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-2">
                                Choose how Slack mini appears to you
                            </p>
                        </div>
                    </div>
                </section>

                <Separator />

                {/* Notification Settings */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Bell className="size-4" />
                        Notifications
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                            <div className="flex-1">
                                <p className="font-medium">Enable Notifications</p>
                                <p className="text-sm text-muted-foreground">
                                    Receive browser notifications for messages and mentions
                                </p>
                                {notificationPermission === "denied" && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                        ⚠️ Notifications blocked. Enable in browser settings.
                                    </p>
                                )}
                            </div>
                            <Switch
                                checked={notifications}
                                onCheckedChange={handleNotificationsChange}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                            <div className="flex-1">
                                <p className="font-medium flex items-center gap-2">
                                    <Volume2 className="size-4" />
                                    Notification Sounds
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Play sounds when receiving notifications
                                </p>
                            </div>
                            <Switch
                                checked={soundEnabled}
                                onCheckedChange={handleSoundEnabledChange}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                            <div className="flex-1">
                                <p className="font-medium">Read Receipts</p>
                                <p className="text-sm text-muted-foreground">
                                    Let others know when you've read their messages
                                </p>
                            </div>
                            <Switch
                                checked={readReceipts}
                                onCheckedChange={handleReadReceiptsChange}
                                disabled={isSaving}
                            />
                        </div>
                        
                        {/* Test Sounds Section */}
                        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                            <p className="font-medium mb-3">Test Notifications & Sounds</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTestNotificationSound}
                                    disabled={!soundEnabled}
                                >
                                    Test Notification Sound
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTestMentionSound}
                                    disabled={!soundEnabled}
                                >
                                    Test Mention Sound
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTestSentSound}
                                    disabled={!soundEnabled}
                                >
                                    Test Sent Sound
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTestBrowserNotification}
                                    disabled={!notifications || notificationPermission !== "granted"}
                                >
                                    Test Browser Notification
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {!soundEnabled && "Enable sounds above to test audio"}
                                {soundEnabled && !notifications && "Enable notifications to test browser notifications"}
                            </p>
                        </div>
                    </div>
                </section>

                <Separator />

                {/* Privacy Settings */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Shield className="size-4" />
                        Privacy
                    </h2>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                                <p className="font-medium">Status Visibility</p>
                                <p className="text-sm text-muted-foreground">
                                    Let others see when you're online
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </section>

                <Separator />

                {/* Accessibility Settings */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Eye className="size-4" />
                        Accessibility
                    </h2>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="font-medium">Reduce Motion</p>
                                <p className="text-sm text-muted-foreground">
                                    Minimize animations and transitions
                                </p>
                            </div>
                            <Switch />
                        </div>
                    </div>
                </section>

                <Separator />

                {/* Danger Zone */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                        Danger Zone
                    </h2>
                    <div className="p-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
                        <p className="text-sm text-red-900 dark:text-red-200 mb-4">
                            These actions cannot be undone. Please proceed with caution.
                        </p>
                        <Button variant="destructive" className="w-full">
                            Delete Account
                        </Button>
                    </div>
                </section>

                {/* Info Section */}
                <section className="space-y-4 pt-4">
                    <p className="text-xs text-muted-foreground text-center">
                        Need help? Check out our{" "}
                        <Link href="#" className="hover:underline text-sky-600">
                            support documentation
                        </Link>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default SettingsPage;
