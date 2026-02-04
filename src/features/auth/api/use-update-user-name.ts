import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UpdateUserNameOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export const useUpdateUserName = () => {
    const updateName = useMutation(api.users.updateName);

    const mutate = async (userId: Id<"users">, name: string, options?: UpdateUserNameOptions) => {
        try {
            const result = await updateName({ userId, name });
            options?.onSuccess?.();
            return result;
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            options?.onError?.(err);
            throw err;
        }
    };

    return { mutate };
};
