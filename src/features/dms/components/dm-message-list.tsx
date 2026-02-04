"use client";

import React, { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface DMMessage {
    _id: string;
    body: string;
    createdAt?: number;
    sender?: {
        _id: string;
    };
    senderUser?: {
        name: string;
        image?: string;
    };
}

interface DMMessageListProps {
    messages: DMMessage[] | undefined;
    currentUserId: string | undefined;
    isLoading?: boolean;
}

export const DMMessageList = ({
    messages,
    currentUserId,
    isLoading = false,
}: DMMessageListProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Loading messages...</p>
            </div>
        );
    }

    if (!messages || messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                    No messages yet. Start the conversation!
                </p>
            </div>
        );
    }

    return (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
        >
            {messages.map((message) => {
                const isOwn = message.sender?._id === currentUserId;
                const displayName =
                    message.senderUser?.name || "Unknown User";
                const displayImage = message.senderUser?.image;

                return (
                    <div
                        key={message._id}
                        className={cn(
                            "flex gap-2 items-end",
                            isOwn && "flex-row-reverse"
                        )}
                    >
                        {!isOwn && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage
                                    src={displayImage || undefined}
                                    alt={displayName}
                                />
                                <AvatarFallback className="bg-slate-300 text-xs">
                                    {displayName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                                "max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm",
                                isOwn
                                    ? "bg-blue-500 text-white rounded-br-none"
                                    : "bg-slate-100 dark:bg-slate-800 text-foreground rounded-bl-none"
                            )}
                        >
                            {!isOwn && (
                                <p className="text-xs font-semibold opacity-70 mb-1">
                                    {displayName}
                                </p>
                            )}
                            <p className="break-words">{message.body}</p>
                            {message.createdAt && (
                                <p
                                    className={cn(
                                        "text-xs mt-1",
                                        isOwn
                                            ? "opacity-70"
                                            : "opacity-50"
                                    )}
                                >
                                    {new Date(
                                        message.createdAt
                                    ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

