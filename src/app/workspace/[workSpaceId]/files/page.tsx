"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader } from "lucide-react";
import { useConvex } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/features/files/components/file-upload";
import { FileList } from "@/features/files/components/file-list";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetFiles, useUploadFile, useDeleteFile, useRenameFile } from "@/features/files/api";
import { toast } from "sonner";

export default function FilesPage() {
  const router = useRouter();
  const convex = useConvex();
  const workspaceId = useWorkspaceId();
  const currentMember = useCurrentMember({ workspaceId });
  const files = useGetFiles({ workspaceId });
  const uploadFile = useUploadFile();
  const deleteFile = useDeleteFile();
  const renameFile = useRenameFile();

  const memberId = currentMember.data?._id;

  const handleUpload = async (
    file: File,
    metadata: { name: string; fileName: string; fileSize: number; fileType: string },
    storageId: string
  ) => {
    if (!memberId) {
      toast.error("Member not found");
      return;
    }

    try {
      // Save file metadata to database
      await uploadFile({
        workspaceId,
        memberId: memberId as any,
        storageId: storageId as any,
        ...metadata,
      });

      toast.success("File uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save file metadata");
      throw error;
    }
  };

  const handleDelete = async (fileId: string) => {
    await deleteFile({ fileId: fileId as any });
  };

  const handleRename = async (fileId: string, newName: string) => {
    await renameFile({ fileId: fileId as any, newName });
  };

  const handleDownload = async (file: any) => {
    try {
      const url = await convex.query(api.files.getFileUrl, { 
        storageId: file.storageId 
      });

      if (!url) {
        throw new Error("Failed to get download URL");
      }

      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download file");
    }
  };

  return (
    <div className="h-full flex flex-col overflow-auto bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Files</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Upload Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Upload Files</h2>
          <FileUpload onUpload={handleUpload} maxSize={100} />
        </div>

        {/* Files List Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Files</h2>
          <FileList
            files={files?.data}
            isLoading={files?.isLoading ?? false}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        </div>
      </div>
    </div>
  );
}
