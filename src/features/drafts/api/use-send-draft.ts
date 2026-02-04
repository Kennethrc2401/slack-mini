import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

type RequestType = {
    draftId: Id<"drafts">;
    channelId?: Id<"channels">;
    conversationId?: Id<"conversations">;
};

type ResponseType = Id<"messages"> | null;

type Options = {
    onSuccess?: (data: ResponseType) => void;
    onError?: (error: Error) => void;
};

export const useSendDraft = () => {
    const mutation = useMutation(api.drafts.sendDraft);
    const { userId } = useAuth();

    const mutate = async (values: RequestType, options?: Options) => {
        try {
            if (!userId) {
                throw new Error("User not authenticated");
            }

            const response = await mutation({
                ...values,
                userId: userId as Id<"users">,
            });
            options?.onSuccess?.(response);
            return response;
        } catch (error) {
            options?.onError?.(error as Error);
            throw error;
        }
    };

    return { mutate };
};

