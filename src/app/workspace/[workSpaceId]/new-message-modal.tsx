import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

interface NewMessageModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    members: (Doc<"members"> & { user: Doc<"users"> })[];
}

export const NewMessageModal = ({
    open,
    setOpen,
    members,
}: NewMessageModalProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const [searchText, setSearchText] = useState("");

    const filteredMembers = members.filter((member) =>
        member.user.name?.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleSelectMember = (memberId: string) => {
        setOpen(false);
        setSearchText("");
        router.push(`/workspace/${workspaceId}/member/${memberId}`);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Start a new message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder="Search for members..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        autoFocus
                    />
                    <div className="max-h-[400px] overflow-y-auto border rounded-md p-4 space-y-2">
                        {filteredMembers.length === 0 ? (
                            <div className="text-center text-sm text-gray-500 py-8">
                                No members found
                            </div>
                        ) : (
                            filteredMembers.map((member) => (
                                <button
                                    key={member._id}
                                    onClick={() => handleSelectMember(member._id)}
                                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors text-left"
                                >
                                    <Avatar className="size-8">
                                        <AvatarImage
                                            src={member.user.image}
                                            alt={member.user.name}
                                        />
                                        <AvatarFallback>
                                            {member.user.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {member.user.name}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
