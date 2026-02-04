import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Id } from "../../../../convex/_generated/dataModel";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import { useWorkspaceId } from "@/hooks/use-workspace-id";

const userItemVariants = cva(
    "flex items-center gap-2.5 justify-start font-normal h-8 px-3 py-2 text-sm overflow-hidden rounded transition-colors",
    {
        variants: {
            variant: {
                default: "text-[#f9edffcc] hover:bg-white/10",
                active: "text-white bg-white/20 hover:bg-white/25",
            }
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

interface UserItemProps {
    id: Id<"members">;
    label?: string;
    image?: string;
    variant?: VariantProps<typeof userItemVariants>["variant"];
};

export const UserItem = ({ 
    id, 
    label = "Member", 
    image, 
    variant 
}: UserItemProps) => {
    const workspaceId = useWorkspaceId();
    const avatarFallback = label.charAt(0).toUpperCase();

    return (
        <Link href={`/workspace/${workspaceId}/member/${id}`}>
            <Button
                variant={"transparent"}
                className={cn(userItemVariants({ variant: variant }))}
                size={"sm"}
            >
                <Avatar className="size-6 rounded-md shrink-0">
                    <AvatarImage className="rounded-md" src={image} />
                    <AvatarFallback className="rounded-md bg-sky-500 text-white text-xs font-semibold">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate flex-1">
                    {label}
                </span>
            </Button>
        </Link>
    )
};