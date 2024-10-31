import { BellIcon, CalendarDays, FileStackIcon, Hash, Headphones, Home, Layers, LucidePlay, MessagesSquare, MoreHorizontal, UsersRoundIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { SidebarButton } from "./sidebar-button";
import { UserButton } from "@/features/auth/components/user-button";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { FcOrganization } from "react-icons/fc";
import { FaTasks } from "react-icons/fa";



export const Sidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const workspaceId = useWorkspaceId();
    const member = useCurrentMember({ workspaceId });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const memberId = member?.data?._id;

    return (
        <aside className="w-[70px] h-full bg-[#481349] flex flex-col gap-y-4 items-center pt-[9px] pb-4">
            <WorkspaceSwitcher />
            <SidebarButton 
                icon={Home}
                label="Home"
                isActive={pathname.startsWith(`/workspace/${workspaceId}`) && !pathname.includes("/dms")}
                onClick={() => router.push(`/workspace/${workspaceId}`)}
            />
            <SidebarButton 
                icon={MessagesSquare}
                label="DMs"
                isActive={pathname.startsWith(`/workspace/${workspaceId}/dms`)}
                onClick={() => router.push(`/workspace/${workspaceId}/dms`)}
            />
            <SidebarButton 
                icon={BellIcon}
                label="Activity"
                isActive={pathname.startsWith(`/workspace/${workspaceId}/activity`)}
                onClick={() => router.push(`/workspace/${workspaceId}/activity`)}
            />
            <SidebarButton 
                icon={CalendarDays}
                label="Calendar"
                isActive={pathname.startsWith(`/workspace/${workspaceId}/calendar`)}
                onClick={() => router.push(`/workspace/${workspaceId}/calendar`)}
            />
            <SidebarButton
                icon={FaTasks}
                label="Todos"
                isActive={pathname.startsWith(`/workspace/${workspaceId}/todos`)}
                onClick={() => router.push(`/workspace/${workspaceId}/todos`)}
            />
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <SidebarButton 
                        icon={MoreHorizontal}
                        label="More"
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                    align="center"
                    side="right"
                    className="w-60"
                >
                    <DropdownMenuItem className="h-10 bg-[#F5F5F5] text-[#5C3B58]">
                        <LucidePlay className="size-4 mr-2 text-[#5C3B58]" />
                        Automations
                    </DropdownMenuItem>
                    <DropdownMenuItem className="h-10 bg-[#F5F5F5] text-[#5C3B58]">
                        <Headphones className="size-4 mr-2 text-[#5C3B58]" />
                        Huddles
                    </DropdownMenuItem>
                    <DropdownMenuItem className="h-10">
                        <FileStackIcon className="size-4 mr-2 text-[#5C3B58]" />
                        Canvases
                    </DropdownMenuItem>
                    <DropdownMenuItem className="h-10 bg-[#F5F5F5] text-[#5C3B58]">
                        <Layers className="size-4 mr-2 text-[#5C3B58]" />
                        Files
                    </DropdownMenuItem>
                    <DropdownMenuItem className="h-10 bg-[#F5F5F5] text-[#5C3B58]">
                        <Hash className="size-4 mr-2 text-[#5C3B58]" />
                        Channels
                    </DropdownMenuItem>
                    <DropdownMenuItem className="h-10 bg-[#F5F5F5] text-[#5C3B58]">
                        <UsersRoundIcon className="size-4 mr-2 text-[#5C3B58]" />
                        People
                    </DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem className="h-10 bg-[#F5F5F5] text-[#5C3B58]">
                        <FcOrganization className="size-4 mr-2 text-[#5C3B58]" />
                        External Connections
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex flex-col items-center justify-center gap-y-1 ml-1 mt-auto">
                <UserButton />
            </div>
        </aside>
    );
};
