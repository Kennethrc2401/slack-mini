"use client";

import React, { useEffect, useState } from "react";
import { FcCheckmark } from "react-icons/fc";
import { MdCheckBox } from "react-icons/md";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members"; // Assume this hook fetches all members
import { useGetUserActivities } from "@/features/activity/api/use-get-user-activities";
import { useUpdateIsReadStatus } from "@/features/activity/api/use-update-is-read-status";
import { Checkbox } from "@/components/ui/checkbox";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Hint } from "@/components/hint";
import { useDeleteActivity } from "@/features/activity/api/use-delete-activity";
import { Trash } from "lucide-react";

interface Activity {
    _id: string;
    createdAt: number;
    isRead?: boolean;
    actionType: string;
    actionDetails?: string;
    initiatorMemberId?: string;
    initiatorName?: string;
}

interface Member {
    user: {
        _id: string;
        name?: string;
    };
}

const ActivityPage: React.FC = () => {
    const workspaceId = useWorkspaceId();
    const { data: activities = [], isLoading: activitiesLoading } = useGetUserActivities({ workspaceId });
    const { data: members = [], isLoading: membersLoading } = useGetMembers({ workspaceId });
    const { updateIsReadStatus }  = useUpdateIsReadStatus();
    const { deleteActivity } = useDeleteActivity(); 

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_memberMap, setMemberMap] = useState<{ [key: string]: string }>({});
    const [visibleActivities, setVisibleActivities] = useState(10); // Initially show 10 activities

    useEffect(() => {
        // Create a mapping of memberId to member name
        if (members) {
            const map: { [key: string]: string } = {};
            members.forEach((member: Member) => {
                map[member.user._id] = member.user.name || "Unknown User";
            });
            setMemberMap(map);
        }
    }, [members]);

    const loadMoreActivities = () => {
        setVisibleActivities((prev) => prev + 10); // Load 10 more activities each time
    };

    if (activitiesLoading || membersLoading) return <div className="text-center p-4">Loading activities...</div>;

    const formatActivityDetails = (actionDetails: string | undefined): string => {
        if (!actionDetails) return "No additional details.";
        
        // Clean up the action details string to make it user-friendly
        return actionDetails
            .replace(/{"ops":\[{"insert":"|"}\]}/g, "")
            .replace(/\\n/g, " ")
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    const getActionTypeLabel = (actionType: string): string => {
        switch (actionType.toUpperCase()) {
            case "CREATE_EVENT":
                return "created an event";
            case "UPDATE_EVENT":
                return "updated an event";
            case "DELETE_EVENT":
                return "deleted an event";
            case "JOIN_WORKSPACE":
                return "joined the workspace";
            case "LEAVE_WORKSPACE":
                return "left the workspace";
            case "NEW_MESSAGE":
                return "sent a message";    
            case "REPLY":
                return "replied to a message";
            case "REACTION":
                return "reacted to a message";
            default:
                return actionType;
        }
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Recent Activity</h1>
            <div className="space-y-4">
                {activities.slice(0, visibleActivities).map((activity: Activity) => (
                    <div
                        key={activity._id}
                        className={`p-4 border rounded-lg ${activity.isRead ? "bg-gray-100" : "bg-white"}`}
                    >
                        <Hint label={activity.isRead ? "Mark as unread" : "Mark as read"}>
                            <Checkbox
                                checked={activity.isRead}
                                onClick={() => {
                                    updateIsReadStatus({ activityId: activity._id as Id<"activity">, isRead: !activity.isRead });
                                }}
                            >
                                {activity.isRead ? <MdCheckBox /> : <FcCheckmark />}
                            </Checkbox>
                        </Hint>
                        <Hint label="Dismiss">
                            <button
                                className="float-right text-red-500"
                                onClick={() => {
                                    deleteActivity({ activityId: activity._id as Id<"activity"> });
                                }}
                            >
                                <Trash size={20} />
                            </button>
                        </Hint>
                        <p className="text-sm text-gray-500">
                            {new Date(activity.createdAt).toLocaleString()}
                        </p>
                        <p className="font-medium">
                            {/* {`${memberMap[activity.initiatorMemberId ?? ""] || "Unknown User"} ${getActionTypeLabel(activity.actionType)}`} */}
                            {`${activity.initiatorName || "Unknown User"} ${getActionTypeLabel(activity.actionType)}`}
                        </p>
                        <p className="text-gray-700">
                            {formatActivityDetails(activity.actionDetails)}
                        </p>
                    </div>
                ))}
                {visibleActivities < activities.length && (
                    <button
                        onClick={loadMoreActivities}
                        className="mt-4 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                        Load More
                    </button>
                )}
            </div>
        </div>
    );
};

export default ActivityPage;