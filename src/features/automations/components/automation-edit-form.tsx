"use client";

import { useForm } from "react-hook-form";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useUpdateAutomation } from "../api/use-update-automation";
import { toast } from "sonner";

interface AutomationEditFormProps {
    workspaceId: Id<"workspaces">;
    automation: Doc<"automations">;
    onSuccess?: () => void;
}

const TIMEZONES = [
    { label: "UTC", value: "UTC" },
    { label: "Eastern Time", value: "America/New_York" },
    { label: "Central Time", value: "America/Chicago" },
    { label: "Mountain Time", value: "America/Denver" },
    { label: "Pacific Time", value: "America/Los_Angeles" },
    { label: "London", value: "Europe/London" },
    { label: "Paris", value: "Europe/Paris" },
    { label: "Tokyo", value: "Asia/Tokyo" },
    { label: "Sydney", value: "Australia/Sydney" },
];

export const AutomationEditForm = ({
    workspaceId,
    automation,
    onSuccess,
}: AutomationEditFormProps) => {
    const { register, watch, handleSubmit } = useForm({
        defaultValues: {
            channelId: automation.channelId,
            time: automation.time,
            timezone: automation.timezone,
        },
    });

    const { data: channels } = useGetChannels({ workspaceId });
    const { update, isLoading } = useUpdateAutomation();

    const onSubmit = useCallback(
        async (data: { channelId: string; time: string; timezone: string }) => {
            try {
                await update(automation._id, {
                    channelId: data.channelId as Id<"channels">,
                    time: data.time,
                    timezone: data.timezone,
                });

                toast.success("Automation updated!");
                onSuccess?.();
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Failed to update automation",
                );
            }
        },
        [update, automation._id, onSuccess],
    );

    const time = watch("time");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label htmlFor="channel">Channel</Label>
                <select
                    id="channel"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...register("channelId")}
                >
                    <option value="">Select a channel</option>
                    {channels?.map((channel) => (
                        <option key={channel._id} value={channel._id}>
                            # {channel.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <Label htmlFor="time">Time of day</Label>
                <Input
                    id="time"
                    type="time"
                    className="mt-1"
                    {...register("time")}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    Automation will run at {time} every weekday
                </p>
            </div>

            <div>
                <Label htmlFor="timezone">Timezone</Label>
                <select
                    id="timezone"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...register("timezone")}
                >
                    {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                            {tz.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Updating..." : "Update automation"}
                </Button>
            </div>
        </form>
    );
};
