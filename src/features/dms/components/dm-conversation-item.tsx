"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface DMConversationItemProps {
    name: string;
    image?: string | null;
    lastMessage: string;
    isSelected: boolean;
    onClick: () => void;
}

export const DMConversationItem = ({
    name,
    image,
    lastMessage,
    isSelected,
    onClick,
}: DMConversationItemProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-900",
                isSelected && "bg-slate-100 dark:bg-slate-900"
            )}
        >
            <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={image || undefined} alt={name} />
                <AvatarFallback className="bg-blue-500 text-white">
                    {name?.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{name}</p>
                <p className="text-xs text-muted-foreground truncate">
                    {lastMessage}
                </p>
            </div>
        </button>
    );
};

