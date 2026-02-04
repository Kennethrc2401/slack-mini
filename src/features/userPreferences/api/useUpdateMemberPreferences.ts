import { useMutation } from "convex/react";
import { useCallback, useMemo, useState } from "react";

import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface UseUpdateMemberPreferencesProps {
    workspaceId: Id<"workspaces">;
    memberId: Id<"members">;
    theme?: "light" | "dark" | "system" | "lgbtq" | "trans" | "lesbian" | "bi" | "gay" | "queer";
    notificationsEnabled?: boolean;
    soundEnabled?: boolean;
    readReceipts?: boolean;
}

type ResponseType = null | { success: boolean };
type Options = {
    onSuccess?: (data: ResponseType) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
};

export const useUpdateMemberPreferences = () => {
    const [data, setData] = useState<ResponseType>(null);
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);
    const { userId } = useAuth();

    const isPending = useMemo(() => status === "pending", [status]);
    const isSuccess = useMemo(() => status === "success", [status]);
    const isError = useMemo(() => status === "error", [status]);
    const isSettled = useMemo(() => status === "settled", [status]);

    const updatePreferences = useMutation(api.userPreferences.updateMemberPreferencesById);

    const mutate = useCallback(
        async (values: UseUpdateMemberPreferencesProps, options?: Options) => {
            try {
                setData(null);
                setError(null);
                setStatus("pending");

                if (!userId) {
                    throw new Error("User not authenticated");
                }

                const response = await updatePreferences({
                    ...values,
                    userId: userId as Id<"users">,
                });
                setData({ success: true }); // Ensure this matches the ResponseType
                setStatus("success");
                options?.onSuccess?.({ success: true });
                return response;
            } catch (error) {
                setError(error as Error);
                setStatus("error");
                options?.onError?.(error as Error);
                if (options?.throwError) {
                    throw error;
                }
            } finally {
                setStatus("settled");
                options?.onSettled?.();
            }
        },
        [updatePreferences, userId]
    );

    return {
        mutate,
        data,
        error,
        isPending,
        isSuccess,
        isError,
        isSettled,
    };
};

