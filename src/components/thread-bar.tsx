import { formatDistanceToNow } from "date-fns";
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "./ui/avatar";
import { ChevronRight } from "lucide-react";


interface ThreadBarProps {
    count?: number;
    image?: string;
    timestamp?: number;
    name?: string;
    onClick?: () => void;
}

export const ThreadBar = ({ 
    count, 
    image, 
    name = "Member",
    timestamp, 
    onClick 
}: ThreadBarProps) => {
    if (!count || !timestamp) return null;

    const avatarFallback = name.charAt(0).toUpperCase();

    return (
        <button
            onClick={onClick}
            className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-start group/thread-bar transition max-w-[600px]"
        >
            <div className="flex items-center gap-2.5 overflow-hidden">
                <Avatar className="size-8 shrink-0 border border-slate-200 dark:border-slate-700">
                    <AvatarImage src={image} alt={name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold text-sm">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                    <span className="text-xs text-sky-700 hover:underline font-bold truncate">
                        {count} {count > 1 ? "replies" : "reply"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate group-hover/thread-bar:hidden block">
                        Last reply {formatDistanceToNow(timestamp, { addSuffix: true })}
                    </span>
                    <span className="text-xs text-muted-foreground truncate group-hover/thread-bar:block hidden">
                        View thread
                    </span>
                </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground ml-auto opacity-0 group-hover/thread-bar:opacity-100 transition shrink-0" />
        </button>
    );
};