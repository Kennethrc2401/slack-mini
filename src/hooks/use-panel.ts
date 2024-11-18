import { useEffect } from 'react';
import throttle from 'lodash.throttle';
import { useProfileMemberId } from "@/features/members/store/use-profile-member-id";
import { useParentMessageId } from "@/features/messages/store/use-parent-message-id";
import { useRouter } from 'next/navigation';
import { useWorkspaceId } from './use-workspace-id';

export const usePanel = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();

    const [parentMessageId, setParentMessageId] = useParentMessageId();
    const [profileMemberId, setProfileMemberId] = useProfileMemberId();

    const throttledUpdateURL = throttle(() => {
        console.log("Throttled URL update");
        console.log("Updated parentMessageId:", parentMessageId);
        console.log("Updated profileMemberId:", profileMemberId);
    }, 1000); // Adjust the throttle time as needed

    useEffect(() => {
        throttledUpdateURL();
    }, [parentMessageId, profileMemberId, throttledUpdateURL]);


    const onVisitProfile = (memberId: string) => {
        console.log("Visiting profile", memberId);

        router.push(`/workspace/${workspaceId}/member/${memberId}`);
    };

    const onOpenProfile = (memberId: string) => {
        console.log("Opening profile", memberId);
        console.log("Current parentMessageId:", parentMessageId);
        console.log("Current profileMemberId:", profileMemberId);
        setProfileMemberId(memberId);
        // if (parentMessageId !== null) {
        //     setParentMessageId(null);
        // }
    };

    const onOpenMessage = (messageId: string) => {
        console.log("Opening message", messageId);
        console.log("Current parentMessageId:", parentMessageId);
        console.log("Current profileMemberId:", profileMemberId);
        setParentMessageId(messageId);
        // if (profileMemberId !== null) {
        //     setProfileMemberId(null);
        // }
    };

    const onClose = () => {
        console.log("Closing panel");
        setParentMessageId(null);
        setProfileMemberId(null);
    };

    return {
        parentMessageId,
        profileMemberId,
        onVisitProfile,
        onOpenProfile,
        onOpenMessage,
        onClose,
    };
};