import { useEffect } from 'react';
import throttle from 'lodash.throttle';
import { useProfileMemberId } from "@/features/members/store/use-profile-member-id";
import { useParentMessageId } from "@/features/messages/store/use-parent-message-id";

export const usePanel = () => {
    const [parentMessageId, setParentMessageId] = useParentMessageId();
    const [profileMemberId, setProfileMemberId] = useProfileMemberId();

    const throttledUpdateURL = throttle(() => {
        console.log("Throttled URL update");
        console.log("Updated parentMessageId:", parentMessageId);
        console.log("Updated profileMemberId:", profileMemberId);
    }, 1000); // Adjust the throttle time as needed

    useEffect(() => {
        throttledUpdateURL();
    }, [parentMessageId, profileMemberId]);

    const onOpenProfile = (memberId: string) => {
        console.log("Opening profile", memberId);
        console.log("Current parentMessageId:", parentMessageId);
        console.log("Current profileMemberId:", profileMemberId);
        setProfileMemberId(memberId);
        if (parentMessageId !== null) {
            setParentMessageId(null);
        }
    };

    const onOpenMessage = (messageId: string) => {
        console.log("Opening message", messageId);
        console.log("Current parentMessageId:", parentMessageId);
        console.log("Current profileMemberId:", profileMemberId);
        setParentMessageId(messageId);
        if (profileMemberId !== null) {
            setProfileMemberId(null);
        }
    };

    const onClose = () => {
        console.log("Closing panel");
        setParentMessageId(null);
        setProfileMemberId(null);
    };

    return {
        parentMessageId,
        profileMemberId,
        onOpenProfile,
        onOpenMessage,
        onClose,
    };
};


// import { useParentMessageId } from "@/features/messages/store/use-parent-message-id";
// import { useProfileMemberId } from "@/features/members/store/use-profile-member-id";
// import { useEffect } from "react";

// export const usePanel = () => {
//     const [parentMessageId, setParentMessageId] = useParentMessageId();
//     const [profileMemberId, setProfileMemberId] = useProfileMemberId();

//     useEffect(() => {
//         console.log("Updated parentMessageId:", parentMessageId);
//         console.log("Updated profileMemberId:", profileMemberId);
//     }, [parentMessageId, profileMemberId]);


//     const onOpenProfile = (
//         memberId: string 

//     ) => {
//         console.log("Opening profile", memberId);
//         console.log("Current parentMessageId:", parentMessageId);
//         console.log("Current profileMemberId:", profileMemberId);
//         setProfileMemberId(memberId);
//         if (parentMessageId !== null) {
//             setParentMessageId(null);
//         }
//     };

//     const onOpenMessage = (messageId: string) => {
//         console.log("Opening message", messageId);
//         console.log("Current parentMessageId:", parentMessageId);
//         console.log("Current profileMemberId:", profileMemberId);
//         setParentMessageId(messageId);
//         setProfileMemberId(null);
//         if (profileMemberId !== null) {
//             setProfileMemberId(null);
//         }
//         console.log("Updated parentMessageId:", parentMessageId);
//         console.log("Updated profileMemberId:", profileMemberId);
//     };

//     const onClose = () => {
//         console.log("Closing panel");
//         setParentMessageId(null);
//         setProfileMemberId(null);
//     };

//     return {
//         parentMessageId,
//         profileMemberId,
//         onOpenProfile,
//         onOpenMessage,
//         onClose,
//     };
// };