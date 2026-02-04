import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

export const useUpdateDM = () => {
    const updateDM = useMutation(api.dms.updateDM);
    const { userId } = useAuth();

    const handleUpdateDM = async ({ dmId, body }: { dmId: Id<"dms">; body: string }) => {
        try {
            if (!userId) {
                throw new Error("User not authenticated");
            }

            const result = await updateDM({ dmId: dmId as Id<"dms">, body, userId: userId as Id<"users"> });
            console.log("DM updated successfully.");
        } catch (error) {
            console.error("Error updating DM:", error);
            throw new Error("Failed to update DM."); // Handle the error as needed
        }
    };

    return { handleUpdateDM };
};

