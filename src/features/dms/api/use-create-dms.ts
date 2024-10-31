import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const useCreateDM = () => {
    const createDM = useMutation(api.dms.createDM);

    const handleCreateDM = async ({ workspaceId, memberId, body }: { workspaceId: Id<"workspaces">; memberId: Id<"members">; body: string }) => {
        try {
            const newDMId = await createDM({ workspaceId, memberId, body });
            return newDMId; // Return the ID of the newly created DM
        } catch (error) {
            console.error("Error creating DM:", error);
            throw new Error("Failed to create DM."); // Handle the error as needed
        }
    };

    return { handleCreateDM };
};
