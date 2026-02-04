import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ListFilter, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";

import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Hint } from "@/components/hint";
import { PreferencesModal } from "./preferences-modal";
import { InviteModal } from "./invite-modal";
import { NewMessageModal } from "./new-message-modal";
import { FilterConversationsModal } from "./filter-conversations-modal";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members";

interface WorkspaceHeaderProps {
    workspace: Doc<"workspaces">;
    isAdmin: boolean;
};

export const WorkspaceHeader = ({ workspace, isAdmin }: WorkspaceHeaderProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const { data: members } = useGetMembers({ workspaceId });
    
    const [inviteOpen, setInviteOpen] = useState(false);
    const [preferencesOpen, setPreferencesOpen] = useState(false);
    const [newMessageOpen, setNewMessageOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterText, setFilterText] = useState("");
    
    return (
        <>
            <InviteModal 
                open={inviteOpen}
                setOpen={setInviteOpen}
                name={workspace.name}
                joinCode={workspace.joinCode}
            />
            <PreferencesModal 
                open={preferencesOpen}
                setOpen={setPreferencesOpen}
                initialValue={workspace.name}
            />
            <NewMessageModal
                open={newMessageOpen}
                setOpen={setNewMessageOpen}
                members={members || []}
            />
            <FilterConversationsModal
                open={filterOpen}
                setOpen={setFilterOpen}
                filterText={filterText}
                setFilterText={setFilterText}
            />
            <div className="flex items-center justify-between px-4 h-[49px] gap-0.5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="transparent"
                            className="font-semibold text-lg w-auto p-1.5 overflow-hidden"
                            size={"sm"}
                        >
                            <span className="truncate">
                                {workspace.name}
                            </span>
                            <ChevronDown className="size-4 ml-1 shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="bottom"
                        align="start"
                        className="w-64"
                    >
                        <DropdownMenuItem
                            className="cursor-pointer capitalize"
                        >
                            <div className="size-9 relative overflow-hidden bg-[#616061] text-white font-semibold text-xl rounded-md flex items-center justify-center mr-2">
                                {workspace.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col items-start">
                                <p className="font-bold">
                                    {workspace.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Active workspace
                                </p>
                            </div>
                        </DropdownMenuItem>

                        {isAdmin && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer py-2"
                                    onClick={() => setInviteOpen(true)}
                                >
                                    Invite people to {workspace.name}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer py-2"
                                    onClick={() => setPreferencesOpen(true)}
                                >
                                    Preferences
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-0.5">
                    <Hint label="Filter conversations" side="bottom">
                        <Button
                            variant={"transparent"}
                            size={'iconSm'}
                            onClick={() => setFilterOpen(true)}
                        >
                            <ListFilter className="size-4" />
                        </Button>
                        </Hint>
                        <Hint label="New message" side="bottom">
                            <Button
                                variant={"transparent"}
                                size={'iconSm'}
                                onClick={() => setNewMessageOpen(true)}
                            >
                                <SquarePen className="size-4" />
                            </Button>
                        </Hint>
                </div>
            </div>
        </>
    )
};