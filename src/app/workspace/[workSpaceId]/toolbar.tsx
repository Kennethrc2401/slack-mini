import { Button } from "@/components/ui/button";
import { Info, Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"


import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useChannelId } from "@/hooks/use-channel-id";
import { useMemberId } from "@/hooks/use-member-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useState } from "react";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useRouter } from "next/navigation";
import { useProfileMemberId } from "@/features/members/store/use-profile-member-id";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Copy, Check } from "lucide-react";

export const Toolbar = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const channelId = useChannelId();
    const memberId = useMemberId();
    const [_profileMemberId, setProfileMemberId] = useProfileMemberId();
    
    const { data: workspace } = useGetWorkspace({ id: workspaceId });
    const { data: channels } = useGetChannels({ workspaceId });
    const { data: members } = useGetMembers({ workspaceId });

    const [open, setOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const onChannelClick = (channelId: string) => {
        setOpen(false);
        router.push(`/workspace/${workspaceId}/channel/${channelId}`);
    };

    const onMemberClick = (memberId: string) => {
        setOpen(false);
        router.push(`/workspace/${workspaceId}/member/${memberId}`);
    };

    const handleInfoClick = () => {
        if (memberId) {
            // Open member profile panel
            setProfileMemberId(memberId);
        } else {
            // Show workspace info dialog
            setInfoOpen(true);
        }
    };

    const handleCopyCode = () => {
        if (workspace?.joinCode) {
            navigator.clipboard.writeText(workspace.joinCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

  return (
    <nav className="bg-[#481349] flex items-center justify-between h-10 p-1.5">
        <div className="flex-1" />
        <div className="min-w-[280px] max-[642px] grow-[2] shrink">
            <Button
                className="bg-accent/25 hover:bg-accent-25 w-full justify-start h-7 px-2"
                size="sm"
                onClick={() => setOpen(true)}
            >
                <Search className="size-4 text-white mr-2" />
                <span className="text-white text-sm">
                    Search {workspace?.name} Workspace
                </span>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Channels">
                    {channels?.map((channel) => (
                        <CommandItem 
                            key={channel._id}
                            asChild
                            onSelect={() => onChannelClick(channel._id)}
                        >
                            <p>
                                {channel.name}
                            </p>
                        </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Members">
                    {members?.map((member) => (
                        <CommandItem 
                            key={member._id}
                            asChild
                            onSelect={() => onMemberClick(member._id)}
                        >
                            <p>
                                {member.user.name}
                            </p>
                        </CommandItem>
                    ))}
                </CommandGroup>
                </CommandList>
            </CommandDialog>
            <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-[#481349] text-white flex items-center justify-center font-bold">
                                {workspace?.name?.charAt(0).toUpperCase()}
                            </div>
                            {workspace?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Workspace information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Join Code</h3>
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                                <code className="text-sm font-mono flex-1">{workspace?.joinCode?.toUpperCase()}</code>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCopyCode}
                                    className="h-7 w-7 p-0"
                                >
                                    {copied ? (
                                        <Check className="size-4 text-green-600" />
                                    ) : (
                                        <Copy className="size-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Members</h3>
                            <p className="text-lg font-semibold">{members?.length || 0}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Channels</h3>
                            <p className="text-lg font-semibold">{channels?.length || 0}</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
        <div className="ml-auto flex-1 flex items-center justify-end">
            <Button 
                variant="transparent" 
                size={"iconSm"}
                onClick={handleInfoClick}
                title={memberId ? "Show member info" : "Show workspace info"}
            >
                <Info className="size-5 text-white" />
            </Button>
        </div>
    </nav>
  );
};