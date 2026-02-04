"use client";

import React, { useState, useMemo } from "react";
import { Loader, Search, Plus } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetConversations, useGetMessages } from "@/features/dms/api/use-get-dms";
import { useCreateDM } from "@/features/dms/api/use-create-dms";
import { useGetMembers } from "@/features/members/api/use-get-members";

import { DMConversationItem } from "@/features/dms/components/dm-conversation-item";
import { DMHeader } from "@/features/dms/components/dm-header";
import { DMMessageList } from "@/features/dms/components/dm-message-list";
import { DMMessageInput } from "@/features/dms/components/dm-message-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const DMsPage = () => {
    const workspaceId = useWorkspaceId();
    const [selectedMemberId, setSelectedMemberId] = useState<Id<"members"> | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: currentMember, isLoading: isLoadingMember } = useCurrentMember({
        workspaceId: workspaceId as Id<"workspaces">,
    });

    const { data: conversations, isLoading: isLoadingConversations } = useGetConversations({
        workspaceId: workspaceId as Id<"workspaces">,
    });

    const { data: messages, isLoading: isLoadingMessages } = useGetMessages({
        workspaceId: workspaceId as Id<"workspaces">,
        memberId: selectedMemberId || (currentMember?._id as Id<"members">),
    });

    const { data: allMembers } = useGetMembers({ workspaceId: workspaceId as Id<"workspaces"> });
    const { handleCreateDM } = useCreateDM();

    const selectedConversation = useMemo(() => {
        if (!selectedMemberId || !conversations) return null;
        return conversations.find((conv) => conv.memberId === selectedMemberId);
    }, [selectedMemberId, conversations]);

    const filteredConversations = useMemo(() => {
        if (!conversations) return [];
        return conversations.filter((conv) =>
            conv.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [conversations, searchQuery]);

    const handleSendMessage = async (text: string) => {
        if (!selectedMemberId || !currentMember) return;
        try {
            await handleCreateDM({
                workspaceId: workspaceId as Id<"workspaces">,
                memberId: selectedMemberId,
                body: text,
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleStartNewDM = async (memberId: Id<"members">) => {
        setSelectedMemberId(memberId);
    };

    if (isLoadingMember) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!currentMember) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Unable to load member information</p>
            </div>
        );
    }

    return (
        <div className="h-full flex">
            {/* Conversations Sidebar */}
            <div className="w-64 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-950">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h1 className="font-bold text-xl mb-4">Direct Messages</h1>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-9"
                            />
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="icon" variant="outline" className="h-9 w-9">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[400px]">
                                <DialogHeader>
                                    <DialogTitle>Start a new conversation</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3">
                                    {allMembers
                                        ?.filter((m) => m._id !== currentMember._id)
                                        .map((member) => (
                                            <button
                                                key={member._id}
                                                onClick={() => {
                                                    handleStartNewDM(member._id);
                                                }}
                                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage
                                                        src={member.user?.image || undefined}
                                                        alt={member.user?.name}
                                                    />
                                                    <AvatarFallback className="bg-blue-500 text-white">
                                                        {member.user?.name?.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="text-left">
                                                    <p className="font-medium text-sm">
                                                        {member.user?.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {member.role}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Conversations List */}
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {isLoadingConversations ? (
                            <div className="flex justify-center p-4">
                                <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredConversations && filteredConversations.length > 0 ? (
                            filteredConversations.map((conversation) => (
                                <DMConversationItem
                                    key={conversation.memberId}
                                    name={conversation.user?.name || "Unknown"}
                                    image={conversation.user?.image}
                                    lastMessage={conversation.latestMessage?.body || "No messages"}
                                    isSelected={selectedMemberId === conversation.memberId}
                                    onClick={() => setSelectedMemberId(conversation.memberId as Id<"members">)}
                                />
                            ))
                        ) : (
                            <div className="p-4 text-center">
                                <p className="text-sm text-muted-foreground">No conversations yet</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
                <div className="flex-1 flex flex-col">
                    <DMHeader
                        name={selectedConversation.user?.name || "Unknown"}
                        image={selectedConversation.user?.image}
                    />
                    <DMMessageList
                        messages={messages}
                        currentUserId={currentMember?._id}
                        isLoading={isLoadingMessages}
                    />
                    <DMMessageInput
                        onSendMessage={handleSendMessage}
                        isLoading={isLoadingMessages}
                    />
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">
                            Select a conversation or start a new one
                        </p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Message
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[400px]">
                                <DialogHeader>
                                    <DialogTitle>Start a new conversation</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3">
                                    {allMembers
                                        ?.filter((m) => m._id !== currentMember._id)
                                        .map((member) => (
                                            <button
                                                key={member._id}
                                                onClick={() => {
                                                    handleStartNewDM(member._id);
                                                }}
                                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage
                                                        src={member.user?.image || undefined}
                                                        alt={member.user?.name}
                                                    />
                                                    <AvatarFallback className="bg-blue-500 text-white">
                                                        {member.user?.name?.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="text-left">
                                                    <p className="font-medium text-sm">
                                                        {member.user?.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {member.role}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DMsPage;