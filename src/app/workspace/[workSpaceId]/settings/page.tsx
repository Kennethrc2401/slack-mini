"use client";
import { Id } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { MdDisplaySettings } from "react-icons/md";
import { AlertTriangle, ChevronDownIcon, Loader, MailIcon, Settings, Settings2, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useConfirm } from "@/hooks/use-confirm";
import { UserPreferencesModal } from "@/features/userPreferences/components/user-preferences-modal";

import { useGetMember } from "@/features/members/api/use-get-member";
// import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { useGetMemberPreferences } from "@/features/userPreferences/api/useGetUserPreferences";

import { useUserPreferencesModal } from "@/features/userPreferences/store/use-user-preferences-modal";


const UserPreferencesPage = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const currentUser = useCurrentUser();
    const currentMember = useCurrentMember({ workspaceId });

    const [_open, setOpen] = useUserPreferencesModal();
    
    const memberId = currentMember.data?._id as Id<"members">;

    const { data: member, isLoading: isLoadingMember } = useGetMember({ id: memberId });
    const { data: userPreferences, isLoading: isLoadingUserPreferences, isError: isPreferencesFailed } = useGetMemberPreferences({
        workspaceId,
        memberId,
    });

    // const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();


    // Loading state
    if (isLoadingMember) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader />
            </div>
        );
    }

    // Member not found
    if (!member) {
        return (
            <div className="flex items-center justify-center h-full">
                <AlertTriangle size={48} />
                <p className="text-lg mt-4">Member not found</p>
            </div>
        );
    }

    const avatarFallback = member?.user.name?.[0] ?? "M";

    return (
        <>
        <div className="h-full flex flex-col flex-auto overflow-scroll">
            <div className="flex justify-between items-center px-4 border-b h-[49px]">
                <p className="text-lg font-bold">
                    Settings
                </p>
                <Settings2 className="size-6" /> 
            </div>
            <div className="flex flex-col items-center justify-center p-4">
                <Avatar className="max-w-[256px] max-h-[256px] size-full">
                    <AvatarImage 
                        src={member?.user.image} 
                        alt={member?.user.name} 
                    />
                    <AvatarFallback className="aspect-square text-6xl">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
            </div>
            <div className="flex flex-col p-4">
                <p className="text-xl font-bold">
                    {member?.user.name}
                </p>
                
            </div>
            <Separator />
            <div className="flex flex-col p-4">
                <p className="text-sm font-bold mb-4">
                    Contact information
                </p>
                <div className="flex items-center gap-2">
                    <div className="size-9 rounded-md bg-muted flex items-center justify-center">
                        <MailIcon className="size-4" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[13px] font-semibold text-muted-foreground">
                            Email address
                        </p>
                        <Link
                            href={`mailto:${member?.user.email}`}
                            className="text-sm hover:underline text-[#1264a3]"
                        >
                            {member?.user.email}
                        </Link>
                    </div>
                </div>
            </div>
            <Separator />
            <div className="flex flex-col p-4">
                <p className="text-sm font-bold mb-4">
                    General Preferences
                </p>
                <div className="flex items-center gap-2">
                    <div className="size-9 rounded-md bg-muted flex items-center justify-center">
                        <MdDisplaySettings className="size-4" />
                    </div>
                    <div className="flex flex-col">
                        <Button
                        // Depending on user pref value, te values of the variant prop will change
                        // Options are light, dark, lgbtq, or trans
                            variant={userPreferences?.theme?.toString() as "link" | "light" | "dark" | "lgbtq" | "trans" | "lesbian" | "bi" | "gay" | "queer" | "default" | "destructive" | "outline" | "secondary" | "ghost" | "transparent" | null | undefined}
                            onClick={() => {    
                                setOpen(true);
                            }}
                        >
                            Make changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default UserPreferencesPage;