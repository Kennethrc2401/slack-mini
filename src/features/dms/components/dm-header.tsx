"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface DMHeaderProps {
    name: string;
    image?: string | null;
    onBack?: () => void;
    showBackButton?: boolean;
}

export const DMHeader = ({
    name,
    image,
    onBack,
    showBackButton = false,
}: DMHeaderProps) => {
    return (
        <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-2.5">
            {showBackButton && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="h-8 w-8 shrink-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            )}
            <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={image || undefined} alt={name} />
                <AvatarFallback className="bg-blue-500 text-white font-semibold">
                    {name?.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden flex-1">
                <h2 className="font-semibold text-sm truncate">{name}</h2>
                <p className="text-xs text-muted-foreground">Active now</p>
            </div>
        </div>
    );
};

