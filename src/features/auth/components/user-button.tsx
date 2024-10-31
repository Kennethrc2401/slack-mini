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
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { useAuthActions } from "@convex-dev/auth/react";
import { Loader, LogOut, Settings, User2Icon } from "lucide-react";

export const UserButton = () => {
    const { signOut } = useAuthActions();
    const { data, isLoading } = useCurrentUser();

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
                >
                    <User2Icon
                        className="size-4 mr-2 text-[#5C3B58]"
                    />
                    Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="h-10"
                >
                    <Settings
                        className="size-4 mr-2 text-[#5C3B58]"
                    />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => signOut()}
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