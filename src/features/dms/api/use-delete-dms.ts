import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

export const useDeleteDM = () => {
    const deleteDM = useMutation(api.dms.deleteDM);
    const { userId } = useAuth();

    const handleDeleteDM = async (dmId: Id<"dms">) => {
        try {
            if (!userId) {
                throw new Error("User not authenticated");
            }

            const result = await deleteDM({ dmId: dmId as Id<"dms">, userId: userId as Id<"users"> });
            console.log("DM deleted successfully.");
        } catch (error) {
            console.error("Error deleting DM:", error);
            throw new Error("Failed to delete DM."); // Handle the error as needed
        }
    };

    return { handleDeleteDM };
};

