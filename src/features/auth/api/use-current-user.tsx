import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Id } from "../../../../convex/_generated/dataModel";

export const useCurrentUser = () => {
    const { userId } = useAuth();
    const data = useQuery(
        api.users.current,
        userId ? { userId: userId as Id<"users"> } : "skip"
    );
    const isLoading = data === undefined;

    return {
        data,
        isLoading,
    };
};
