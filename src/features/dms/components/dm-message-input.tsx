"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface DMMessageInputProps {
    onSendMessage: (text: string) => Promise<void>;
    isLoading?: boolean;
    placeholder?: string;
}

export const DMMessageInput = ({
    onSendMessage,
    isLoading = false,
    placeholder = "Type a message...",
}: DMMessageInputProps) => {
    const [text, setText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSend = async () => {
        if (!text.trim() || isSending) return;

        setIsSending(true);
        try {
            await onSendMessage(text);
            setText("");
            inputRef.current?.focus();
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex gap-2">
            <Input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading || isSending}
                className="flex-1"
            />
            <Button
                onClick={handleSend}
                disabled={!text.trim() || isLoading || isSending}
                size="icon"
                className={cn(
                    "bg-blue-500 hover:bg-blue-600"
                )}
            >
                <Send className="h-4 w-4" />
            </Button>
        </div>
    );
};

