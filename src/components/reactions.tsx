/* eslint-disable react/jsx-key */
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";

import { Doc, Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Hint } from "./hint";
// import { EmojiPopover } from "./emoji-popover";
// import { MdOutlineAddReaction } from "react-icons/md";

interface ReactionsProps {
    data: Array<
        Omit<Doc<"reactions">, "memberId"> & {
            count: number;
            memberId: Id<"members">[];
        }
    >;
    onChange: (value: string) => void;
};

export const Reactions = ({
    data, 
    onChange
}: ReactionsProps) => {
    const workspaceId = useWorkspaceId();
    const { data: currentMember } = useCurrentMember({ workspaceId });

    const currentMemberId = currentMember?._id;

    if (data.length === 0 || !currentMemberId) {
    return null;
}

    return (
    <div className="flex items-center gap-1 mt-1 mb-1">
        {data.map((reaction) => (
            <Hint
                key={reaction._id}
                label={`${reaction.count} ${reaction.count === 1 ? "person" : "people"} reacted with ${reaction.value}`}
            >
                <button
                    className={cn(
                        "h-6 px-2 rounded-full bg-slate-200/70 border border-transparent text-slate-800 flex items-center gap-x-1",
                        reaction.memberId.includes(currentMemberId) && 
                            "bg-blue-100/70 border-blue-500 text-white"
                    )}
                    key={reaction.value}
                    onClick={() => onChange(reaction.value)}
                >
                    {reaction.value}
                    <span
                        className={cn(
                            "text-xs font-semibold text-muted-foreground",
                            reaction.memberId.includes(currentMemberId) &&
                                "text-blue-500",
                        )}
                    >
                    </span>
                </button>
            </Hint>
        ))}
    </div>
);
};