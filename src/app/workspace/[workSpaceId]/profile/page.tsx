"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetMember } from "@/features/members/api/use-get-member";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ArrowLeft, Loader, Mail, User, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const ProfilePage = () => {
    const { userId } = useAuth();
    const workspaceId = useWorkspaceId();
    const currentMember = useCurrentMember({ workspaceId });

    // Get user details from Convex
    const userData = useQuery(
        api.users.current,
        userId ? { userId: userId as Id<"users"> } : "skip"
    );

    const memberId = currentMember.data?._id as Id<"members">;
    const { data: member, isLoading: isLoadingMember } = useGetMember({ id: memberId });

    const isLoading = userData === undefined || isLoadingMember || !currentMember.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!userData || !member) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <AlertTriangle className="size-12 text-red-500" />
                <p className="text-lg font-semibold">Profile not found</p>
            </div>
        );
    }

    const avatarFallback = userData.name?.[0].toUpperCase() ?? "U";
    const joinDate = member._creationTime ? new Date(member._creationTime) : null;

    return (
        <div className="h-full flex flex-col overflow-auto bg-white dark:bg-slate-950">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-3">
                <Link href={`/workspace/${workspaceId}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Profile</h1>
            </div>

            {/* Profile Content */}
            <div className="flex-1 p-6 space-y-6">
                {/* Avatar and Name Section */}
                <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24 border-4 border-slate-200 dark:border-slate-700">
                        <AvatarImage src={userData.image || undefined} alt={userData.name || "User"} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-3xl font-bold">
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">{userData.name || "Unknown User"}</h2>
                        <p className="text-sm text-muted-foreground">{member.role === "admin" ? "Admin" : "Member"}</p>
                    </div>
                </div>

                <Separator />

                {/* User Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        User Information
                    </h3>

                    {/* Email */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Email</p>
                            <p className="font-medium break-all">{userData.email || "No email"}</p>
                        </div>
                    </div>

                    {/* Join Date */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Joined</p>
                            <p className="font-medium">
                                {joinDate ? formatDistanceToNow(joinDate, { addSuffix: true }) : "Unknown"}
                            </p>
                            {joinDate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {joinDate.toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Role */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Role</p>
                            <div className="flex items-center gap-2">
                                <p className="font-medium capitalize">{member.role}</p>
                                {member.role === "admin" && (
                                    <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                                        Administrator
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Quick Actions
                    </h3>
                    <Link href={`/workspace/${workspaceId}/settings`} className="block">
                        <Button className="w-full" variant="outline">
                            Edit Preferences
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
