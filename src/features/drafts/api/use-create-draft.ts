import { useMutation } from "convex/react";
import { useCallback, useMemo, useState } from "react";

import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

type RequestType = {
    body: string;
    image?: Id<"_storage">;
    workspaceId: Id<"workspaces">;
    channelId?: Id<"channels">;
    conversationId?: Id<"conversations">;
};

type ResponseType = Id<"drafts"> | null;

type Options = {
    onSuccess?: (data: ResponseType) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
};

export const useCreateDraft = () => {
    const [data, setData] = useState<ResponseType>(null);
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);

    const isPending = useMemo(() => status === "pending", [status]);
    const isSuccess = useMemo(() => status === "success", [status]);
    const isError = useMemo(() => status === "error", [status]);

    const mutation = useMutation(api.drafts.create);
    const { userId } = useAuth();

    const mutate = useCallback(async (values: RequestType, options?: Options) => {
        try {
            setData(null);
            setError(null);
            setStatus("pending");

            if (!userId) {
                throw new Error("User not authenticated");
            }

            const response = await mutation({
                ...values,
                userId: userId as Id<"users">,
            });
            setData(response);
            setStatus("success");
            options?.onSuccess?.(response);

            return response;
        } catch (error) {
            setError(error as Error);
            setStatus("error");
            options?.onError?.(error as Error);
            if (options?.throwError) {
                throw error;
            }
        } finally {
            options?.onSettled?.();
        }
    }, [mutation]);

    return {
        mutate,
        data,
        error,
        isPending,
        isSuccess,
        isError,
    };
};

