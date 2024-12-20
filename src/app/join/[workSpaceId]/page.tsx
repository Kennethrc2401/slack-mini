"use client";

import VerificationInput from "react-verification-input";
import { useMemo, useEffect } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Id } from "../../../../convex/_generated/dataModel";
import { useJoin } from "@/features/workspaces/api/use-join";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";

const JoinPage = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const { mutate, isPending } = useJoin();
    const {data, isLoading } = useGetWorkspaceInfo({ 
        id: workspaceId as Id<"workspaces">,
    });
    const isMember = useMemo(() => data?.isMember, [data?.isMember]);

    useEffect(() => {
        if (isMember) {
            router.push(`/workspace/${workspaceId}`);
        }
    }, [isMember, router, workspaceId]);

    const handleComplete = (value: string) => {
        mutate({
            workspaceId: workspaceId as Id<"workspaces">,
            joinCode: value,
        }, {
            onSuccess: (id) => {
                router.replace(`/workspaces/${id}`);
                // router.replace(`/`);
                toast.success("Workspace joined successfully");
            },
            onError: () => {
                toast.error("Failed to join workspace. Please try again.");
            }
        });
    };
    
    if (!workspaceId) {
        return <div>Error: Workspace ID is missing.</div>;
    }

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    };

  return (
    <div className="h-full flex flex-col gap-y-8 items-center bg-white p-8 rounded-lg shadow-md">
        <Image
            src="/favicon.ico"
            alt="Slack Logo"
            width={60}
            height={60}
            className="rounded-full"
        />

        <div className="flex flex-col gap-y-4 items-center justify-center max-w-md">
            <div className=" flex flex-col gap-y-2 items-center justify-center">
                <h1 className="text-2xl font-bold">
                    Join {data?.name}
                </h1>
                <p className="text-md text-muted-foreground">
                    Enter the workspace code to join
                </p>
            </div>
            <VerificationInput 
                classNames={{
                    container: cn("flex gap-x-2", isPending && "opacity-50 pointer-not-allowed"),
                    character: "uppercase h-auto rounded-md border border-gray-300 flex items-center justify-center text-lg font-medium text-gray-500",
                    characterInactive: "bg-muted",
                    characterSelected: "bg-white text-black",
                    characterFilled: "bg-white text-black",
                }}
                autoFocus
                length={6}
                onComplete={handleComplete}
            />
        </div>
        <div className="flex gap-x-4">
            <Button
                size={"lg"}
                variant={"outline"}
                asChild
            >
                <Link
                    href="/"
                >
                    Back to home
                </Link>
            </Button>
        </div>
    </div>
  );
};

export default JoinPage;