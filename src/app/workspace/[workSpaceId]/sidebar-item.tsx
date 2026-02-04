import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { IconType } from "react-icons/lib";
import { cva, type VariantProps } from "class-variance-authority";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";

const sidebarItemVariants = cva(
    "flex items-center gap-2 justify-start font-normal h-8 px-4 py-2 text-sm overflow-hidden rounded transition-colors",
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

interface SidebarItemProps {
    label: string;
    id: string;
    icon: LucideIcon | IconType;
    variant?: VariantProps<typeof sidebarItemVariants>["variant"];
    type?: "channel" | "thread" | "drafts" | "files";
};

export const SidebarItem = ({
    label,
    id,
    icon: Icon,
    variant,
    type = "channel",
}: SidebarItemProps) => {
    const workspaceId = useWorkspaceId();

    let href = ``;
    if (type === "channel") {
        href = `/workspace/${workspaceId}/channel/${id}`;
    } else if (type === "thread") {
        href = `/workspace/${workspaceId}/threads`;
    } else if (type === "drafts") {
        href = `/workspace/${workspaceId}/drafts`;
    } else if (type === "files") {
        href = `/workspace/${workspaceId}/files`;
    }

    return (
        <Button 
            asChild
            variant={"transparent"}
            className={cn(sidebarItemVariants({ variant }))}
            size={"sm"}
        >
            <Link href={href}>
                <Icon className="size-5 mr-1 shrink-0" />
                <span className="text-sm truncate">
                    {label}
                </span>
            </Link>
        </Button>
    )
};