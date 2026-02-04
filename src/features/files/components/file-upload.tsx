"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";

interface FileUploadProps {
    onUpload: (file: File, metadata: { name: string; fileName: string; fileSize: number; fileType: string }, storageId: string) => Promise<void>;
    accept?: string;
    maxSize?: number; // in MB
}

export const FileUpload = ({
    onUpload,
    accept = "*",
    maxSize = 50,
}: FileUploadProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { mutate: generateUploadUrl } = useGenerateUploadUrl();

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const processFile = async (file: File) => {
        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
            toast.error(`File size must be less than ${maxSize}MB`);
            return;
        }

        setSelectedFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            // Generate upload URL from Convex
            const uploadUrl = await generateUploadUrl({}, { throwError: true });

            if (!uploadUrl) {
                throw new Error("Failed to get upload URL");
            }

            // Upload file to Convex storage
            const uploadResponse = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                    "Content-Type": selectedFile.type,
                },
                body: selectedFile,
            });

            if (!uploadResponse.ok) {
                throw new Error("Failed to upload file to storage");
            }

            const { storageId } = await uploadResponse.json();

            // Call the parent handler to save metadata
            await onUpload(selectedFile, {
                name: selectedFile.name.replace(/\.[^.]*$/, ""), // Remove extension
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                fileType: selectedFile.type,
            }, storageId);

            setSelectedFile(null);
            if (inputRef.current) {
                inputRef.current.value = "";
            }
            toast.success("File uploaded successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload file");
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className="w-full space-y-4">
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleInputChange}
                className="hidden"
            />

            {!selectedFile ? (
                <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                        isDragging
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
                    )}
                >
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="font-medium text-sm">
                        Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Maximum file size: {maxSize}MB
                    </p>
                </div>
            ) : (
                <div className="border border-slate-300 dark:border-slate-600 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancel}
                            disabled={isUploading}
                            className="h-8 w-8 shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="flex-1"
                        >
                            {isUploading ? (
                                <>
                                    <Loader className="h-4 w-4 animate-spin mr-2" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
