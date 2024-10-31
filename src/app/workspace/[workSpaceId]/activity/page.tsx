"use client";

import React from "react";
import { useGetUserActivities } from "@/features/activity/api/use-get-user-activities";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
// import { useGetMember } from "@/features/members/api/use-get-member";



const ActivityPage= () => {
    const workspaceId = useWorkspaceId();
    const { data: activities, isLoading } = useGetUserActivities({ workspaceId });

    if (isLoading) return <div className="text-center p-4">Loading activities...</div>;

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Recent Activity</h1>
            <div className="space-y-4">
                {activities?.map((activity) => (
                    <div
                        key={activity._id}
                        className={`p-4 border rounded-lg ${activity.isRead ? "bg-gray-100" : "bg-white"}`}
                    >
                        <p className="text-sm text-gray-500">
                            {new Date(activity.createdAt).toLocaleString()}
                        </p>
                        <p className="font-medium">{activity.actionType}</p>
                        {/* Need to remove other characters {"ops":[{"insert":"Hi\n"}]} including the \n*/}
                        <p className="text-gray-700">
                            {activity.actionDetails &&
                            activity.actionDetails?.replace(/{"ops":\[{"insert":"|"}\]}/g, "").replace(/\n/g, " ").trim()
                            || "No additional details."
                        }</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityPage;
