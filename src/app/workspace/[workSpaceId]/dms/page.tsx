"use client";

import React, { useState } from 'react';
import { Id } from '../../../../../convex/_generated/dataModel';
// import { Form } from '@/components/ui/form';

import { useGetDMs } from '@/features/dms/api/use-get-dms';
import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useCreateDM } from '@/features/dms/api/use-create-dms';
import { useGetMember } from '@/features/members/api/use-get-member';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader } from 'lucide-react';

const DMsLandingPage = () => {
    const workspaceId = useWorkspaceId();
    const members = useGetMembers({ workspaceId });
    const { data: currentMember, isLoading: isLoadingMember } = useCurrentMember({ workspaceId });

    const [selectedMember, setSelectedMember] = useState<Id<"members"> | null>(null);
    const { data: dms, isLoading } = useGetDMs({
        workspaceId,
        memberId: selectedMember || (currentMember?._id as Id<"members">),
    });

    const { handleCreateDM } = useCreateDM();
    const [newDMBody, setNewDMBody] = useState<string>("");

    const handleCreateNewDM = async () => {
        try {
            await handleCreateDM({ workspaceId, memberId: currentMember?._id as Id<"members">, body: newDMBody });
            setNewDMBody("");
        } catch (error) {
            console.error("Error creating DM:", error);
        }
    };

    const { data: memberData, isLoading: isLoadingMemberData } = useGetMember({ id: currentMember?._id as Id<"members"> });

    if (isLoadingMember) return <div className="text-center">Loading current member...</div>;
    if (!currentMember) return <div className="text-center">No member found.</div>;

    if (isLoading || isLoadingMemberData) {
        return (
            <div
                className="flex items-center justify-center w-full h-full"
            >
                <Loader className="w-8 h-8 text-blue-500" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Your Direct Messages</h1>
            <div className="bg-white p-4 rounded-lg shadow hover:bg-gray-100 transition duration-200">
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <button className="bg-blue-500 text-white p-2 rounded">Select User</button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSelectedMember(null)}>
                            Show All DMs
                        </DropdownMenuItem>
                        {members?.data?.map((member) => (
                            <DropdownMenuItem key={member._id} onClick={() => setSelectedMember(member._id)}>
                                <div className="flex items-center justify-between w-full p-2 hover:bg-gray-100 transition duration-200">
                                    <Avatar>
                                        {member.user.image ? (
                                            <AvatarImage
                                                src={member.user.image}
                                                alt={member.user.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <AvatarFallback className="w-8 h-8 rounded-full bg-blue-500 text-white">
                                                {member.user.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="ml-2 flex flex-col justify-center w-full">
                                        <p className="text-sm font-semibold">{member.user.name}</p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <ul className="space-y-4">
                {dms?.map((dm) => (
                    <li key={dm._id} className="bg-white p-4 rounded-lg shadow hover:bg-gray-100 transition duration-200">
                        <div className="text-gray-700">
                            <p>{dm.body}</p>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                            <span className="font-semibold">
                                From: {memberData?.user?._id === currentMember.userId ? "You" : memberData?.user.name}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="mt-6">
                {/* <Form> */}
                    <form
                        className="space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleCreateNewDM();
                        }}
                    >
                    <input
                        type="text"
                        value={newDMBody}
                        onChange={(e) => setNewDMBody(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full p-2 border border-gray-300 rounded mt-2"
                    />
                    <button type="button" onClick={handleCreateNewDM} className="mt-4 w-full bg-blue-500 text-white p-2 rounded">
                        Send
                    </button>
                    </form>
                {/* </Form> */}
            </div>
        </div>
    );
};

export default DMsLandingPage;