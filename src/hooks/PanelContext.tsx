import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import throttle from 'lodash.throttle';
import { Id } from '../../convex/_generated/dataModel';

interface PanelContextProps {
    parentMessageId: Id<"messages"> | null;
    profileMemberId: Id<"members"> | null;
    onOpenProfile: (memberId: Id<"members">) => void;
    onOpenMessage: (messageId: Id<"messages">) => void;
    onClose: () => void;
}

const PanelContext = createContext<PanelContextProps | undefined>(undefined);

export const PanelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [parentMessageId, setParentMessageId] = useState<Id<"messages"> | null>(null);
    const [profileMemberId, setProfileMemberId] = useState<Id<"members"> | null>(null);

    const throttledUpdateURL = throttle(() => {
        console.log("Throttled URL update");
        console.log("Updated parentMessageId:", parentMessageId);
        console.log("Updated profileMemberId:", profileMemberId);
    }, 1000); // Adjust the throttle time as needed

    useEffect(() => {
        throttledUpdateURL();
    }, [parentMessageId, profileMemberId]);

    const onOpenProfile = (memberId: Id<"members">) => {
        console.log("Opening profile", memberId);
        setProfileMemberId(memberId);
        setParentMessageId(null);
    };

    const onOpenMessage = (messageId: Id<"messages">) => {
        console.log("Opening message", messageId);
        setParentMessageId(messageId);
        setProfileMemberId(null);
    };

    const onClose = () => {
        console.log("Closing panel");
        setParentMessageId(null);
        setProfileMemberId(null);
    };

    return (
        <PanelContext.Provider value={{ parentMessageId, profileMemberId, onOpenProfile, onOpenMessage, onClose }}>
            {children}
        </PanelContext.Provider>
    );
};

export const usePanel = () => {
    const context = useContext(PanelContext);
    if (!context) {
        throw new Error("usePanel must be used within a PanelProvider");
    }
    return context;
};