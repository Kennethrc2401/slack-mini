import { 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

import { Id } from "../../../../convex/_generated/dataModel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";

import { useGetMemberPreferences } from "../api/useGetUserPreferences";
import { useUpdateMemberPreferences } from "../api/useUpdateMemberPreferences";
import { useUserPreferencesModal } from "../store/use-user-preferences-modal";

export const UserPreferencesModal = () => {
    const workspaceId = useWorkspaceId();
    const currentMember = useCurrentMember({ workspaceId });

    const memberId = currentMember.data?._id as Id<"members">;

    const { data: existingPreferences, isLoading: isLoadingPreferences } = useGetMemberPreferences({
        workspaceId,
        memberId,
    });
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mutate: updatePreferences, isPending, isSuccess, isError } = useUpdateMemberPreferences();

    const [open, setOpen] = useUserPreferencesModal();
    const [theme, setTheme] = useState(existingPreferences?.theme || "light");

    const handleClose = () => {
        setOpen(false);
    };

    const handleThemeChange = (newTheme: "light" | "dark" | "system" | "lgbtq" | "trans" | "lesbian" | "bi" | "gay" | "queer") => {
        setTheme(newTheme);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        updatePreferences(
            {
                workspaceId,
                memberId,
                theme,
            },
            {
                onSuccess: () => {
                    toast.success("Preferences updated successfully!");
                    handleClose();
                },
                onError: (error) => {
                    toast.error(`Error updating preferences: ${error.message}`);
                },
                onSettled: () => {
                    // Additional logic if needed after mutation
                },
            }
        );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={handleClose}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Theme Selection</DialogTitle>
                </DialogHeader>
                <form 
                    className="space-y-4"
                    onSubmit={handleSubmit}    
                >
                    <div>
                        <h3 className="text-lg font-semibold">
                            Choose a theme
                        </h3>
                        <div 
                            className="flex flex-wrap items-start mt-2 space-x-4"
                            >
                            {["light", "dark", "system", "lgbtq", "trans", "lesbian", "bi", "gay", "queer"].map((option) => (
                                <label key={option} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="theme"
                                        value={option}
                                        checked={theme === option}
                                        onChange={() => handleThemeChange(option as "light" | "dark" | "system" | "lgbtq" | "trans" | "lesbian" | "bi" | "gay" | "queer")}
                                    />
                                    <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            disabled={isPending || isLoadingPreferences}
                        >
                            {isPending ? "Updating..." : "Save Preferences"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

