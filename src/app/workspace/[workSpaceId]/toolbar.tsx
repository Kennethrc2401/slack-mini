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
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useState } from "react";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useRouter } from "next/navigation";

export const Toolbar = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    
    const { data } = useGetWorkspace({ id: workspaceId });
    const { data: channels } = useGetChannels({ workspaceId });
    const { data: members } = useGetMembers({ workspaceId });

    const [open, setOpen] = useState(false);

    const onChannelClick = (channelId: string) => {
        setOpen(false);
        router.push(`/workspace/${workspaceId}/channel/${channelId}`);
    };

    const onMemberClick = (memberId: string) => {
        setOpen(false);
        router.push(`/workspace/${workspaceId}/member/${memberId}`);
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
                    Search {data?.name} Workspace
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
        </div>
        <div className="ml-auto flex-1 flex items-center justify-end">
            <Button variant="transparent" size={"iconSm"}>
                <Info className="size-5 text-white" />
            </Button>
        </div>
    </nav>
  );
};