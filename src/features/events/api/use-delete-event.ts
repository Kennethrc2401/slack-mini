import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const useDeleteEvent = () => {
    const deleteEvent = useMutation(api.events.deleteEvent);

    return (workspaceId: Id<"workspaces">, eventId: Id<"events">) => deleteEvent({ workspaceId, eventId });
};
