"use client";

import { useState } from "react";
import { Download, Trash2, Edit2, File, Loader, FileText, Image, FileJson, FileCode, Music, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface FileItem {
    _id: string;
    name: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    storageId: string;
    createdAt: number;
    uploadedByMember: any;
}

interface FileListProps {
    files: FileItem[] | undefined;
    isLoading: boolean;
    onDownload: (file: FileItem) => Promise<void>;
    onDelete: (fileId: string) => Promise<void>;
    onRename: (fileId: string, newName: string) => Promise<void>;
}

const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.startsWith("image/")) return Image;
    if (type.includes("pdf")) return FileText;
    if (type.includes("json")) return FileJson;
    if (type.includes("code") || type.includes("javascript") || type.includes("typescript")) return FileCode;
    if (type.startsWith("audio/")) return Music;
    if (type.startsWith("video/")) return Video;
    return File;
};

const isImageFile = (fileType: string) => fileType.toLowerCase().startsWith("image/");

export const FileList = ({
    files,
    isLoading,
    onDownload,
    onDelete,
    onRename,
}: FileListProps) => {
    const [renameId, setRenameId] = useState<string | null>(null);
    const [renameName, setRenameName] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);

    const handleDownload = async (file: FileItem) => {
        try {
            await onDownload(file);
        } catch (error) {
            console.error(error);
            toast.error("Failed to download file");
        }
    };

    const handleDelete = async (fileId: string) => {
        if (confirm("Are you sure you want to delete this file?")) {
            try {
                await onDelete(fileId);
                toast.success("File deleted");
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete file");
            }
        }
    };

    const handleRenameSubmit = async (fileId: string) => {
        if (!renameName.trim()) {
            toast.error("File name cannot be empty");
            return;
        }

        setIsRenaming(true);
        try {
            await onRename(fileId, renameName);
            setRenameId(null);
            toast.success("File renamed");
        } catch (error) {
            console.error(error);
            toast.error("Failed to rename file");
        } finally {
            setIsRenaming(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!files || files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <File className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No files yet</p>
                <p className="text-sm text-muted-foreground">
                    Upload your first file to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {files.map((file) => {
                const IconComponent = getFileIcon(file.fileType);
                const showPreview = isImageFile(file.fileType);

                return (
                <div key={file._id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {showPreview ? (
                            <div className="h-10 w-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                <img 
                                    src={URL.createObjectURL(new Blob())} 
                                    alt={file.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="h-10 w-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <IconComponent className="h-5 w-5 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.fileSize)} •{" "}
                                {formatDistanceToNow(new Date(file.createdAt), {
                                    addSuffix: true,
                                })}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-4 w-4">
                                    <AvatarImage
                                        src={file.uploadedByMember?.user?.image}
                                        alt={file.uploadedByMember?.user?.name}
                                    />
                                    <AvatarFallback className="text-[10px]">
                                        {file.uploadedByMember?.user?.name?.[0] ?? "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                    {file.uploadedByMember?.user?.name ?? "Unknown"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                                setRenameId(file._id);
                                setRenameName(file.name);
                            }}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownload(file)}
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={() => handleDelete(file._id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Rename Dialog */}
                    <Dialog open={renameId === file._id} onOpenChange={(open) => !open && setRenameId(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Rename File</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Input
                                    placeholder="Enter new file name"
                                    value={renameName}
                                    onChange={(e) => setRenameName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleRenameSubmit(file._id);
                                        }
                                    }}
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => setRenameId(null)}
                                        disabled={isRenaming}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => handleRenameSubmit(file._id)}
                                        disabled={isRenaming}
                                    >
                                        {isRenaming ? (
                                            <>
                                                <Loader className="h-4 w-4 animate-spin mr-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                );
            })}
        </div>
    );
};
