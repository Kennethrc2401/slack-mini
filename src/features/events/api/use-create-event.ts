import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

export const useCreateEvent = () => {
    const createEvent = useMutation(api.events.createEvent);
    const { userId } = useAuth();

    return (workspaceId: Id<"workspaces">, title: string, description: string, date: Date) =>
        createEvent({
            workspaceId,
            title,
            description,
            date: date.toISOString(),
            userId: userId as Id<"users">,
        });
};

