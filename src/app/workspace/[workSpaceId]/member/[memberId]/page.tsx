"use client";

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, Loader } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Conversation } from "./conversation";

const MemberIdPage = () => {
    const workspaceId = useWorkspaceId();
    const memberId = useMemberId();
    const { userId } = useAuth();
    const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);

    // Use ref to keep track of mutation completion and prevent refetching
    const isMutationCompleted = useRef(false);
    
    const { mutate, isPending } = useCreateOrGetConversation();

    useEffect(() => {
        if (!workspaceId || !memberId || !userId || isMutationCompleted.current) {
            // Skip if workspaceId, memberId are not ready or if mutation is already completed
            return;
        }

        // Trigger mutation and mark as completed to avoid refetch loops
        isMutationCompleted.current = true;
        mutate(
            {
                workspaceId,
                memberId,
            },
            {
                onSuccess: (response) => {
                    if (response) {
                        setConversationId(response);
                    }
                },
                onError: (error) => {
                    console.error("Mutation failed with error:", error);
                    toast.error(`Failed to create conversation: ${error.message}`);
                },
            }
        );
    }, [workspaceId, memberId, mutate]);

    // Debugging logs for sanity checks
    console.log("conversationId state:", conversationId);
    console.log("isPending state:", isPending);

    if (isPending) {
        return (
            <div className="h-full flex flex-1 items-center justify-center">
                <Loader className="animate-spin size-6 text-muted-foreground" />
            </div>
        );
    }

    if (!conversationId) {
        return (
            <div className="h-full flex flex-col gap-y-2 items-center justify-center">
                <AlertTriangle className="size-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                    Conversation not found
                </span>
            </div>
        );
    }

    return (
        <Conversation
            id={conversationId}
        />
    );
};

export default MemberIdPage;