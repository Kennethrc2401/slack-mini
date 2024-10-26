import { useMutation } from "convex/react";
import { useCallback, useMemo, useState } from "react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

type RequestType = {
    workspaceId: Id<"workspaces">;
    memberId: Id<"members">;
};

type ResponseType = Id<"conversations"> | null;

type Options = {
    onSuccess?: (data: ResponseType) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
};
export const useCreateOrGetConversation = () => {
    const [data, setData] = useState<ResponseType>(null);
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);

    // Memoize booleans based on `status`
    const isPending = useMemo(() => status === "pending", [status]);
    const isSuccess = useMemo(() => status === "success", [status]);
    const isError = useMemo(() => status === "error", [status]);
    const isSettled = useMemo(() => status === "settled", [status]);

    // Mutation setup
    const mutation = useMutation(api.conversations.createOrGet);

    // The mutate function
    const mutate = useCallback(async (values: RequestType, options?: Options) => {
        if (status === "pending") return; // Prevent another call if already loading

        try {
            setStatus("pending");
            setError(null);

            const response = await mutation(values);

            setData(response);
            setStatus("success");
            options?.onSuccess?.(response);
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
    }, [mutation, status]);

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

// export const useCreateOrGetConversation = () => {
//     const [data, setData] = useState<ResponseType>(null);
//     const [error, setError] = useState<Error | null>(null);
//     const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);

//     const isPending = useMemo(() => status === "pending", [status]);
//     const isSuccess = useMemo(() => status === "success", [status]);
//     const isError = useMemo(() => status === "error", [status]);
//     const isSettled = useMemo(() => status === "settled", [status]);

//     const mutation = useMutation(api.conversations.createOrGet);

//     const mutate = useCallback(async (values: RequestType, options?: Options) => {
//         try {
//             setData(null);
//             setError(null);
//             setStatus("pending");

//             const response = await mutation(values);

//             return response;
//         } catch (error) {
//             setStatus("error");
//             options?.onError?.(error as Error);
//             if (options?.throwError) {
//                 throw error;
//             }
//         } finally {
//             setStatus("settled");
//             options?.onSettled?.();
//         }
//     }, [mutation]);

//     return {
//         mutate,
//         data,
//         error,
//         isPending,
//         isSuccess,
//         isError,
//         isSettled,
//     };
// };