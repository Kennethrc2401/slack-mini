import { useQuery } from "convex/react";

import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetMentionsForMemberProps {
    memberId: Id<"members">;
};

export const useGetMentionsForMember = ({ memberId }: UseGetMentionsForMemberProps) => {
    const data = useQuery(api.mentions.getMentionsForMember, { memberId });
    const isLoading = data === undefined;

    return {
        data,
        isLoading,
    };
}; 
