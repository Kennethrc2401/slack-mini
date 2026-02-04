"use client";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetDrafts } from "@/features/drafts/api/use-get-drafts";
import { useSendDraft } from "@/features/drafts/api/use-send-draft";
import { useRemoveDraft } from "@/features/drafts/api/use-remove-draft";
import { Loader, MessageSquareText, Send, Trash2 } from "lucide-react";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });

interface Draft {
    _id: string;
    _creationTime?: number;
    body: string;
    image?: string | null;
    createdAt: number;
    updatedAt: number;
    channelId?: string;
    conversationId?: string;
}

export default function DraftsPage() {
    const workspaceId = useWorkspaceId();
    const { data: drafts, isLoading } = useGetDrafts({ workspaceId });
    const { mutate: sendDraft } = useSendDraft();
    const { mutate: removeDraft } = useRemoveDraft();
    const [sendingId, setSendingId] = useState<string | null>(null);

    const handleSendDraft = async (draft: Draft) => {
        try {
            setSendingId(draft._id);
            await sendDraft({
                draftId: draft._id as any,
                channelId: draft.channelId as any,
                conversationId: draft.conversationId as any,
            });
            toast.success("Draft sent!");
        } catch (error) {
            toast.error("Failed to send draft");
        } finally {
            setSendingId(null);
        }
    };

    const handleDeleteDraft = async (draftId: string) => {
        try {
            await removeDraft({ id: draftId as any });
            toast.success("Draft deleted");
        } catch (error) {
            toast.error("Failed to delete draft");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!drafts || drafts.length === 0) {
        return (
            <div className="flex flex-col h-full">
                <div className="border-b border-gray-200 p-4 h-[49px] flex items-center">
                    <h1 className="text-lg font-bold">Drafts & Sent</h1>
                </div>
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <MessageSquareText className="w-16 h-16 text-gray-300" />
                    <p className="text-xl font-semibold text-gray-600">No drafts</p>
                    <p className="text-sm text-gray-500">
                        Your draft messages will appear here
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="border-b border-gray-200 p-4 h-[49px] flex items-center">
                <h1 className="text-lg font-bold">Drafts & Sent</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-2 p-4">
                    {drafts.map((draft: Draft | null) =>
                        draft ? (
                            <div
                                key={draft._id}
                                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span className="text-xs font-medium text-gray-500 uppercase">
                                                Draft
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {format(new Date(draft.updatedAt), "MMM d, h:mm a")}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-700 mb-3 line-clamp-3">
                                            <Renderer value={draft.body} />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="gap-2"
                                                onClick={() => handleSendDraft(draft)}
                                                disabled={sendingId === draft._id}
                                            >
                                                <Send className="w-4 h-4" />
                                                {sendingId === draft._id ? "Sending..." : "Send"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDeleteDraft(draft._id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null
                    )}
                </div>
            </div>
        </div>
    );
}
