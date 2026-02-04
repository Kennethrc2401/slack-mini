"use client";

import { useForm } from "react-hook-form";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useCreateAutomation } from "../api/use-create-automation";
import { toast } from "sonner";

interface AutomationSetupFormProps {
    workspaceId: Id<"workspaces">;
    automationType: string;
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

export const AutomationSetupForm = ({
    workspaceId,
    automationType,
    onSuccess,
}: AutomationSetupFormProps) => {
    const { register, watch, handleSubmit } = useForm({
        defaultValues: {
            channelId: "",
            time: "09:00",
            timezone: "UTC",
        },
    });

    const { data: channels } = useGetChannels({ workspaceId });
    const { create, isLoading } = useCreateAutomation();

    const time = watch("time");

    const onSubmit = useCallback(
        async (data: { channelId: string; time: string; timezone: string }) => {
            try {
                if (!data.channelId) {
                    toast.error("Please select a channel");
                    return;
                }

                await create(
                    workspaceId,
                    automationType,
                    data.channelId as Id<"channels">,
                    data.time,
                    data.timezone,
                );

                toast.success(`${automationType} automation created!`);
                onSuccess?.();
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Failed to create automation",
                );
            }
        },
        [create, workspaceId, automationType, onSuccess],
    );

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
                    {isLoading ? "Creating..." : "Create automation"}
                </Button>
            </div>
        </form>
    );
};
