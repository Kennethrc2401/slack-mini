"use client";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { 
    DropdownMenu ,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Loader, LogOut, Settings, User2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

export const UserButton = () => {
    const router = useRouter();
    const { userId, signOut } = useAuth();
    const workspaceId = useWorkspaceId();
    
    // Get user details from Convex
    const data = useQuery(
        api.users.current,
        userId ? { userId: userId as Id<"users"> } : "skip"
    );
    const isLoading = data === undefined;

    const handleSignOut = async () => {
        signOut();
        router.push("/auth");
    };

    if (isLoading) {
        return <Loader className="size-4 animate-spin text-muted-foreground" />;
    }

    if (!data) {
        return null;
    }

    const { image, name } = data;
    const avatarFallback = name!.charAt(0).toUpperCase()

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="outline-none relative">
                <Avatar className="rounded-md size-10 hover:opacity-75 transition">
                    <AvatarImage 
                        className="rounded-md"
                        src={image}
                        alt={name}
                    />
                    <AvatarFallback className="rounded-md bg-sky-500 text-white">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                align="center"
                side="right"
                className="w-60"
            >
                <DropdownMenuItem
                    className="h-10"
                    onClick={() => router.push(`/workspace/${workspaceId}/profile`)}
                >
                    <User2Icon
                        className="size-4 mr-2 text-[#5C3B58]"
                    />
                    Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="h-10"
                    onClick={() => router.replace(`/workspace/${workspaceId}/settings`)}
                >
                    <Settings
                        className="size-4 mr-2 text-[#5C3B58]"
                    />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleSignOut()}
                    className="h-10"
                >
                    <LogOut 
                        className="size-4 mr-2  text-[#5C3B58]"
                    />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};
