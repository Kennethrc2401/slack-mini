import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export const useGetFiles = ({ workspaceId }: { workspaceId: any }) => {
    const data = useQuery(api.files.getFiles, { workspaceId });
    const isLoading = data === undefined;
    
    return {
        data: isLoading ? undefined : data,
        isLoading,
    };
};

export const useGetFile = ({ fileId }: { fileId: any | null }) => {
    const data = useQuery(api.files.getFile, fileId ? { fileId } : "skip");
    const isLoading = data === undefined;
    
    return {
        data: isLoading ? undefined : data,
        isLoading,
    };
};

export const useUploadFile = () => {
    return useMutation(api.files.uploadFile);
};

export const useDeleteFile = () => {
    return useMutation(api.files.deleteFile);
};

export const useRenameFile = () => {
    return useMutation(api.files.renameFile);
};

export const useGetFileUrl = ({ storageId }: { storageId: any | null }) => {
    const data = useQuery(api.files.getFileUrl, storageId ? { storageId } : "skip");
    const isLoading = data === undefined;
    
    return {
        data: isLoading ? undefined : data,
        isLoading,
    };
};
