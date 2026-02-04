import { useQuery } from "convex/react";

import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface UseGetMemberProps {
    id: Id<"members">;
};

export const useGetMember = ({ id }: UseGetMemberProps) => {
    const { userId } = useAuth();
    const data = useQuery(
        api.members.getById,
        (id && userId)
            ? { id, userId: userId as Id<"users"> }
            : "skip"
    );
    const isLoading = data === undefined;

    return {
        data,
        isLoading,
    };
}; 
