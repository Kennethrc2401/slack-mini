"use client";

import { Download, File, FileText, Image, FileJson, FileCode, Music, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "../../convex/_generated/dataModel";

interface MessageFile {
    id: Id<"_storage">;
    url: string | null;
}

interface MessageFilesProps {
    files: MessageFile[] | undefined;
}

const getFileIcon = (storageId: string) => {
    // Try to infer from storage ID pattern, but default to File icon
    // Since we don't have full type info, we'll use a generic file icon
    return File;
};

export const MessageFiles = ({ files }: MessageFilesProps) => {
    if (!files || files.length === 0) {
        return null;
    }

    return (
        <div className="mt-2 space-y-2">
            {files.map((file) => {
                const IconComponent = getFileIcon(file.id);
                
                return (
                    <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border",
                            "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700",
                            "hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                        )}
                        download
                    >
                        <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <IconComponent className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                File
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Click to download
                            </p>
                        </div>
                        <Download className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    </a>
                );
            })}
        </div>
    );
};
