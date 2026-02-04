import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

export const useDeleteEvent = () => {
    const deleteEvent = useMutation(api.events.deleteEvent);
    const { userId } = useAuth();

    return (workspaceId: Id<"workspaces">, eventId: Id<"events">) => deleteEvent({
        workspaceId,
        eventId,
        userId: userId as Id<"users">,
    });
};

