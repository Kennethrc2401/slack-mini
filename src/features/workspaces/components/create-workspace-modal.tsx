import { useState } from "react";
import { useRouter } from "next/navigation";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useCreateWorkspaceModal } from "../store/use-create-workspace-modal";
import { useCreateWorkspace } from "../api/use-create-workspace";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Id } from "@convex/_generated/dataModel";

export const CreateWorkspaceModal = () => {
    const router = useRouter();
    const [open, setOpen] = useCreateWorkspaceModal();
    const [name, setName] = useState("");
    const { mutate, isPending } = useCreateWorkspace();
    const { userId } = useAuth();

    // Close modal and reset name
    const handleClose = () => {
        setOpen(false);
        setName("");
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!userId) {
            toast.error("Please sign in first");
            return;
        }

        try {
            const id = await mutate({ name, userId: userId as Id<"users"> }, {
                onSuccess: (id) => {
                    toast.success("Workspace created");
                    router.push(`/workspace/${id}`);
                    handleClose();
                },
                onError: () => {
                    toast.error("Failed to create workspace");
                },
            });

            return id; // Optional: return ID if needed
        } catch (error) {
            // Handle any unexpected errors here if necessary
            console.error("Error creating workspace:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a workspace</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isPending}
                        required
                        autoFocus
                        minLength={3}
                        placeholder="Workspace name e.g. 'Work', 'Personal', 'Home'"
                    />
                    <div className="flex justify-end">
                        <Button disabled={isPending}>
                            Create
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
