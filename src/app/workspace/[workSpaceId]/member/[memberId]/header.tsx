import { Button } from "@/components/ui/button";
import { 
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar";
import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useConfirm } from "@/hooks/use-confirm";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetMember } from "@/features/members/api/use-get-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useRemoveMember } from "@/features/members/api/use-remove-member";
import { toast } from "sonner";
import { AlertTriangle, Loader, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface HeaderProps {
    memberName?: string;
    memberImage?: string;
    memberId?: Id<"members">;
    onClick?: () => void;
    onClose?: () => void;
};

export const Header = ({ 
    memberName  = "Member",
    memberImage,
    memberId,
    onClick,
    onClose
 }: HeaderProps) => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();

    const [menuVisible, setMenuVisible] = useState(false);
    const avatarFallback = memberName?.charAt(0).toUpperCase();

    const [UpdateDialog, confirmUpdate] = useConfirm(
        "Change role",
        "Are you sure you want to change the role of this member?"
    )

    const [LeaveDialog, confirmLeave] = useConfirm(
        "Leave workspace",
        "Are you sure you want to leave this workspace?"
    );

    const [RemoveDialog, confirmRemove] = useConfirm(
        "Remove member",
        "Are you sure you want to remove this member?"
    );

    const { data: currentMember, isLoading: isLoadingCurrentMember } = useCurrentMember({
        workspaceId
    });
    const { data: member, isLoading: isLoadingMember } = useGetMember({ id: memberId as Id<"members"> });

    const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();
    const { mutate: removeMember, isPending: isRemovingMember } = useRemoveMember();


    const onRemove = async () => {
        const ok = await confirmRemove();

        if (!ok) return;

        removeMember({ id: memberId as Id<"members">}, {
            onSuccess: () => {
                toast.success("Member removed successfully");
                if (onClose) onClose();
            },
            onError: () => {
                toast.error("Failed to remove member");
            }
        });
    };

    const onLeave = async () => {
        const ok = await confirmLeave();

        if (!ok) return;

        removeMember({ id: memberId as Id<"members">}, {
            onSuccess: () => {
                router.replace("/");
                toast.success("You have left the workspace");
                if (onClose) onClose();
            },
            onError: () => {
                toast.error("Failed to leave workspace");
            }
        });
    };

    const onRole = async (role: "admin" | "member") => {
        const ok = await confirmUpdate();

        if (!ok) return;

        updateMember({ id: memberId  as Id<"members">, role }, {
            onSuccess: () => {
                toast.success("Role updated successfully");
                if (onClose) onClose();
            },
            onError: () => {
                toast.error("Failed to leave workspace");
            }
        });
    };
    
    const handleClick = () => {
        setMenuVisible(!menuVisible);
        if (onClick) onClick();
    };

    if (isLoadingMember || isLoadingCurrentMember || isUpdatingMember || isRemovingMember) {
        return (
            <div className="h-full flex flex-1 items-center justify-center">
                <Loader className="animate-spin size-6 text-muted-foreground" />
            </div>
        );
    }

    if (!member) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center px-4 border-b h-[49px]">
                    <p className="text-lg font-bold">
                        Profile
                    </p>
                    <Button
                        variant={"ghost"}
                        size={"iconSm"}
                        onClick={onClose}
                    >
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                    <AlertTriangle className="size-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Profile not found
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <RemoveDialog />
            <LeaveDialog />
            <UpdateDialog />
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Button
                        variant={"ghost"}
                        className="text-lg font-semibold px-2 overflow-hidden w-auto"
                        size={"sm"}
                        onClick={() => {
                            handleClick();
                        }}
                    >
                        <Avatar className="size-6 mr-2">
                            <AvatarImage src={memberImage} alt={memberName} />
                            <AvatarFallback>
                                {avatarFallback}
                            </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                            {memberName}
                        </span>
                        <FaChevronDown 
                            className={cn(
                                "size-2.5 ml-2 text-muted-foreground transition-transform",
                                menuVisible ? "rotate-180" : "rotate-0"
                            )} 
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {currentMember?.role === "admin" && (
                        <DropdownMenuItem
                            className="flex items-center gap-x-2"
                        >
                                <Button
                                    variant={"ghost"}
                                    className="w-full text-left hover:bg-gray-100"
                                    size={"sm"}
                                    onClick={() => {
                                        onRole(member?.role === "admin" ? "member" : "admin")
                                        // Close the menu after the action
                                        setMenuVisible(false);
                                    }}
                                >
                                    {member?.role === "admin" ? "Demote" : "Promote"}
                                </Button>
                            </DropdownMenuItem>
                        )}
                        {currentMember?.role === "admin" && (
                            <DropdownMenuItem>
                                <Button
                                    variant={"ghost"}
                                    className="w-full text-left hover:bg-gray-100"
                                    size={"sm"}
                                    onClick={() => {
                                        onRemove();
                                        // Close the menu after the action
                                        setMenuVisible(false);
                                    }}
                                >
                                    Remove
                                </Button>
                            </DropdownMenuItem>
                        )}
                        {currentMember?._id === memberId && (
                            <DropdownMenuItem>
                                <Button
                                    variant={"ghost"}
                                    className="w-full text-left hover:bg-gray-100"
                                    size={"sm"}
                                    onClick={() => {
                                        onLeave();
                                        // Close the menu after the action
                                        setMenuVisible(false);
                                    }}
                                >
                                    Leave
                                </Button>
                        </DropdownMenuItem>
                        )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};