import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
// import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Id } from "../../../../convex/_generated/dataModel";

export const useGetEvents = (
    workspaceId: Id<"workspaces">,
    date: Date
) => {
    // const workspaceId = useWorkspaceId();
    const isoDate = date.toISOString();

    const data = useQuery(api.events.getEventsByDate, { workspaceId, date: isoDate });
    const isLoading = data === undefined;

    return { data, isLoading };
};

