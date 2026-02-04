"use client";

import { useState } from "react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useUpdateAutomation } from "../api/use-update-automation";
import { useDeleteAutomation } from "../api/use-delete-automation";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface AutomationItemProps {
    automation: Doc<"automations">;
    onEdit?: (automation: Doc<"automations">) => void;
}

export const AutomationItem = ({ automation, onEdit }: AutomationItemProps) => {
    const [isToggling, setIsToggling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { update } = useUpdateAutomation();
    const { remove } = useDeleteAutomation();

    const handleToggle = async () => {
        try {
            setIsToggling(true);
            await update(automation._id, { isActive: !automation.isActive });
            toast.success(
                `Automation ${!automation.isActive ? "enabled" : "disabled"}`
            );
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to update automation"
            );
        } finally {
            setIsToggling(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this automation?")) {
            return;
        }
        try {
            setIsDeleting(true);
            await remove(automation._id);
            toast.success("Automation deleted");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to delete automation"
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/30 p-3">
            <div className="flex-1">
                <div className="text-sm font-medium">
                    {automation.type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </div>
                <div className="text-xs text-muted-foreground">
                    {automation.time} • {automation.timezone}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleToggle}
                    disabled={isToggling}
                    className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                        automation.isActive ? "bg-green-600" : "bg-gray-300"
                    } ${isToggling ? "opacity-50" : ""}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            automation.isActive ? "translate-x-5" : "translate-x-1"
                        }`}
                    />
                </button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(automation)}
                    className="h-8 w-8 p-0"
                >
                    <Edit2 size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    );
};
