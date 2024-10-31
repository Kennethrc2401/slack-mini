import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const useUpdateEvent = () => {
    const updateEvent = useMutation(api.events.updateEvent);

    return (
        eventId: Id<"events">,
        updatedFields: Partial<{
            workspaceId: Id<"workspaces">;
            title: string;
            description: string;
            date: string;
        }>
    ) => {
        return updateEvent({
            eventId,
            workspaceId: updatedFields.workspaceId as Id<"workspaces">,
            title: updatedFields.title ?? undefined,
            description: updatedFields.description ?? undefined,
            date: updatedFields.date ?? undefined,
        });
    };
};