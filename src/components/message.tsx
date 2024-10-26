import React from "react";
import dynamic from "next/dynamic";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";
import { Hint } from "./hint";
import { Thumbnail } from "./thumbnail";
import { Toolbar } from "./toolbar";
import { useUpdateMessage } from "@/features/messages/api/use-update-message.ts";
import { useRemoveMessage } from "@/features/messages/api/use-delete-message.ts";
import { useConfirm } from "@/hooks/use-confirm";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import { Reactions } from "@/components/reactions";
import { usePanel } from "@/hooks/use-panel";
import { ThreadBar } from "@/components/thread-bar";

const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface MessageProps {
    id: Id<"messages">;
    memberId: Id<"members">;
    authorImage?: string;
    authorName?: string;
    isAuthor: boolean;
    reactions: Array<
        Omit<Doc<"reactions">, "memberId"> & {
            count: number;
            memberId: Id<"members">[];
        }
        >;
    body: Doc<"messages">["body"];
    image: string | null | undefined;
    createdAt: Doc<"messages">["_creationTime"];
    updatedAt: Doc<"messages">["updatedAt"];
    isEditing: boolean;
    isCompact?: boolean;
    setEditingId: (id: Id<"messages"> | null) => void;
    hideThreadButton?: boolean;
    threadCount?: number;
    threadImage?: string;
    threadName?: string;
    threadTimestamp?: number;
};

const formatFullTime = (date: Date) => {
    return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`;
};

export const Message = ({
    id,
    memberId,
    authorImage,
    authorName = "Member",
    isAuthor,
    reactions,
    body,
    image,
    createdAt,
    updatedAt,
    isEditing,
    isCompact,
    setEditingId,
    hideThreadButton,
    threadCount,
    threadImage,
    threadName,
    threadTimestamp,
}: MessageProps) => {
    const { parentMessageId, onOpenMessage, onOpenProfile, onClose } = usePanel();
    const [ConfirmDialog, confirm] = useConfirm(
        "Delete message",
        "Are you sure you want to delete this message? This action cannot be undone.",
    );

    const { mutate: updateMessage, isPending: isUpdatingPending } = useUpdateMessage();
    const { mutate: removeMessage, isPending: isRemovingMessage } = useRemoveMessage();
    const { mutate: toggleReaction, isPending: isTogglingReaction } = useToggleReaction();

    const isPending = isUpdatingPending || isTogglingReaction;

    const handleReaction = (value: string) => {
        toggleReaction({ messageId: id, value }, {
            onError: () => {
                toast.error("Failed to react to message");
            },
        });
    };

    const handleDelete = async () => {
        const ok = await confirm();

        if (!ok) return;

        removeMessage({ id }, {
            onSuccess: () => {
                toast.success("Message deleted successfully");
            },
            onError: () => {
                toast.error("Failed to delete message");

                if (parentMessageId === id) {
                    onClose();
                }
            },
        });
    };

    const handleUpdate = ({ body }: { body: string }) => {
        updateMessage({ id, body }, {
            onSuccess: () => {
                toast.success("Message updated successfully");
                setEditingId(null); 
                
                if (parentMessageId === id) {
                    onClose();
                }
            },
            onError: () => {
                toast.error("Failed to update message");

                if (parentMessageId === id) {
                    onClose();
                }
            },
        });
    };
    
    // Compact message
    if (isCompact) {
        return (
            <>
            <ConfirmDialog />
            <div className={cn(
                "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
                isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
                isRemovingMessage && 
                    "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200",
            )}>
                <div className="flex items-start gap-2">
                    <Hint label={formatFullTime(new Date(createdAt))}>
                        <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                            {format(new Date(createdAt), "hh:mm")}
                        </button>
                    </Hint>
                </div>
                {isEditing ? (
                    <div className="w-full h-full">
                        <Editor
                            onSubmit={handleUpdate}
                            disabled={isPending}
                            defaultValue={JSON.parse(body)}
                            onCancel={() => setEditingId(null)}
                            variant="update"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col w-full">
                        <Renderer value={body} />
                        <Thumbnail url={image} />
                        {updatedAt ? (
                            <span className="text-xs text-muted-foreground">
                                (Edited)
                                </span>
                        ) : null}
                        <Reactions 
                            data={reactions}
                            onChange={(value) => handleReaction(value)}
                        />
                        <ThreadBar 
                            count={threadCount}
                            image={threadImage}
                            name={threadName}
                            timestamp={threadTimestamp}
                            onClick={() => {
                                console.log('ThreadBar clicked');
                                onOpenMessage(id);
                            }}
                        />
                    </div>
                )}

                {!isEditing && (
                    <Toolbar
                        isAuthor={isAuthor}
                        isPending={isPending}
                        handleEdit={() => {
                            console.log('Edit clicked');
                            setEditingId(id);
                        }}
                        handleThread={() => {
                            onOpenMessage(id);
                            console.log('Reply in Thread clicked');
                        }}
                        handleDelete={handleDelete}
                        handleReaction={handleReaction}
                        hideThreadButton={hideThreadButton}
                    />
                )}
            </div>
            </>
        );
    };
    
    const avatarFallback = authorName.charAt(0).toUpperCase();
    // Non-compact message
    return (
        <>
        <ConfirmDialog />
        <div className={cn(
            "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
            isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
            isRemovingMessage && 
              "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200",
        )}>
            <div className="flex items-start gap-2">
                <button
                    onClick={() => onOpenProfile(memberId)}
                >
                    <Avatar>
                        <AvatarImage src={authorImage} />
                        <AvatarFallback>
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                </button>
                    {isEditing ? (
                        <div className="w-full h-full">
                            <Editor
                                onSubmit={handleUpdate}
                                disabled={isPending}
                                defaultValue={JSON.parse(body)}
                                onCancel={() => setEditingId(null)}
                                variant="update"
                            />
                        </div>
                    ) : (
                    <div className="flex flex-col w-full overflow-hidden">
                        <div className="text-sm">
                            <button
                                className="font-bold text-primary hover:underline"
                                onClick={() => onOpenProfile(memberId)}
                            >
                                {authorName}
                            </button>
                            <span>
                                &nbsp;&nbsp;
                            </span>
                            <Hint label={formatFullTime(new Date(createdAt))}>
                                <button className="text-xs text-muted-foreground hover:underline">
                                    {format(new Date(createdAt), "h:mm a")}
                                </button>
                            </Hint>
                            <div className="flex flex-col w-full">
                                <Renderer value={body} />
                                <Thumbnail url={image} />
                                {updatedAt ? (
                                    <span className="text-xs text-muted-foreground">
                                        (Edited)
                                    </span>
                                ) : null}
                                <Reactions 
                                    data={reactions}
                                    onChange={(value) => handleReaction(value)}
                                />
                                <ThreadBar 
                                    count={threadCount}
                                    image={threadImage}
                                    name={threadName}
                                    timestamp={threadTimestamp}
                                    onClick={() => {
                                        console.log('ThreadBar clicked');
                                        onOpenMessage(id as Id<"messages">);
                                    }}                               
                                />
                            </div>
                        </div>
                    </div>
                    )}

                    {!isEditing && (
                        <Toolbar
                            isAuthor={isAuthor}
                            isPending={isPending}
                            handleEdit={() => {
                                console.log('Edit clicked');
                                setEditingId(id as Id<"messages">);
                            }}
                            handleThread={() => {
                                onOpenMessage(id as Id<"messages">);
                                console.log('Reply in Thread clicked');
                            }}
                            handleDelete={handleDelete}
                            handleReaction={handleReaction}
                            hideThreadButton={hideThreadButton}
                        />
                    )}
            </div>
        </div>
        </>
    );
};