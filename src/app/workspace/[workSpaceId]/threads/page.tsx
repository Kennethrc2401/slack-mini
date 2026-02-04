"use client";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetThreads } from "@/features/messages/api/use-get-threads";
import { Loader, MessageSquareText } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import dynamic from "next/dynamic";

const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });

interface Thread {
    _id: string;
    _creationTime: number;
    body: string;
    image?: string | null;
    user?: {
        _id?: string;
        name?: string;
        image?: string;
    };
    replyCount: number;
    lastReply: {
        timestamp: number;
        user: {
            name?: string;
            image?: string;
        };
    };
    channelId?: string;
    conversationId?: string;
}

export default function ThreadsPage() {
    const workspaceId = useWorkspaceId();
    const { data: threads, isLoading } = useGetThreads({ workspaceId });
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!threads || threads.length === 0) {
        return (
            <div className="flex flex-col h-full">
                <div className="border-b border-gray-200 p-4 h-[49px] flex items-center">
                    <h1 className="text-lg font-bold">Threads</h1>
                </div>
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <MessageSquareText className="w-16 h-16 text-gray-300" />
                    <p className="text-xl font-semibold text-gray-600">No threads yet</p>
                    <p className="text-sm text-gray-500">
                        Threads will appear here when messages get replies
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="border-b border-gray-200 p-4 h-[49px] flex items-center">
                <h1 className="text-lg font-bold">Threads</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-1 p-4">
                    {threads.map((thread: Thread | null) =>
                        thread ? (
                            <button
                                key={thread._id}
                                onClick={() => {
                                    // Navigate to the channel or conversation with the thread open
                                    if (thread.channelId) {
                                        router.push(
                                            `/workspace/${workspaceId}/channel/${thread.channelId}?parentMessageId=${thread._id}`
                                        );
                                    } else if (thread.conversationId) {
                                        router.push(
                                            `/workspace/${workspaceId}/conversation/${thread.conversationId}?parentMessageId=${thread._id}`
                                        );
                                    }
                                }}
                                className="w-full text-left p-4 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
                            >
                                <div className="flex gap-3">
                                    {thread.user?.image && (
                                        <img
                                            src={thread.user.image}
                                            alt={thread.user.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <span className="font-semibold text-sm text-gray-900 group-hover:text-blue-600">
                                                {thread.user?.name || "Unknown"}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {format(new Date(thread._creationTime), "MMM d, h:mm a")}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 truncate">
                                            <Renderer value={thread.body} />
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            <span className="font-medium">{thread.replyCount}</span>{" "}
                                            {thread.replyCount === 1 ? "reply" : "replies"} •{" "}
                                            <span>
                                                Last reply{" "}
                                                {formatDistanceToNow(new Date(thread.lastReply.timestamp), {
                                                    addSuffix: true,
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ) : null
                    )}
                </div>
            </div>
        </div>
    );
}
