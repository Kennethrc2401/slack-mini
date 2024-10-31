import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const useDeleteDM = () => {
    const deleteDM = useMutation(api.dms.deleteDM);

    const handleDeleteDM = async (dmId: Id<"dms">) => {
        try {
            await deleteDM({ dmId });
            console.log("DM deleted successfully.");
        } catch (error) {
            console.error("Error deleting DM:", error);
            throw new Error("Failed to delete DM."); // Handle the error as needed
        }
    };

    return { handleDeleteDM };
};
