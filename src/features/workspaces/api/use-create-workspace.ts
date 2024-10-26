import { useMutation } from "convex/react";
import { useCallback, useMemo, useState } from "react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

// Define the request type for creating a workspace
type RequestType = { name: string };

// Define the response type to include the workspace ID
type ResponseType = Id<"workspaces"> | null;

// Define options for handling success, error, and settled states
type Options = {
    onSuccess?: (data: ResponseType) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
};

// Custom hook for creating a workspace
export const useCreateWorkspace = () => {
    const [data, setData] = useState<ResponseType>(null);
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);

    // Define loading and success/error states based on status
    const isPending = useMemo(() => status === "pending", [status]);
    const isSuccess = useMemo(() => status === "success", [status]);
    const isError = useMemo(() => status === "error", [status]);
    const isSettled = useMemo(() => status === "settled", [status]);

    // Use the mutation for creating a workspace
    const mutation = useMutation(api.workspaces.create);

    const mutate = useCallback(async (values: RequestType, options?: Options) => {
        try {
            // Reset state before starting the mutation
            setData(null);
            setError(null);
            setStatus("pending");

            // Call the mutation and get the response
            const response = await mutation(values);

            // Check if response is not null and extract the ID
            const workspaceId = response?.workspaceId || null;

            // Handle success callback
            options?.onSuccess?.(workspaceId);

            // Return the workspace ID
            return workspaceId;
        } catch (error) {
            setStatus("error");
            // Handle error callback
            options?.onError?.(error as Error);
            if (options?.throwError) {
                throw error;
            }
        } finally {
            // Update status to settled
            setStatus("settled");
            options?.onSettled?.();
        }
    }, [mutation]);

    // Return the state and the mutate function
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