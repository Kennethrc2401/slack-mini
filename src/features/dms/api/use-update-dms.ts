import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const useUpdateDM = () => {
    const updateDM = useMutation(api.dms.updateDM);

    const handleUpdateDM = async ({ dmId, body }: { dmId: Id<"dms">; body: string }) => {
        try {
            await updateDM({ dmId, body });
            console.log("DM updated successfully.");
        } catch (error) {
            console.error("Error updating DM:", error);
            throw new Error("Failed to update DM."); // Handle the error as needed
        }
    };

    return { handleUpdateDM };
};
