"use client";

import { useMemo, useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Id } from "../../../../convex/_generated/dataModel";
import { useJoin } from "@/features/workspaces/api/use-join";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { useAuth } from "@/features/auth/hooks/use-auth";

const JoinPage = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const { mutate, isPending, error } = useJoin();
    const { userId, isLoading: authLoading } = useAuth();
    const {data, isLoading } = useGetWorkspaceInfo({ 
        id: workspaceId as Id<"workspaces">,
    });
    const isMember = useMemo(() => data?.isMember, [data?.isMember]);
    const [code, setCode] = useState("");
    const [lastError, setLastError] = useState<string | null>(null);

    useEffect(() => {
        if (isMember) {
            router.push(`/workspace/${workspaceId}`);
        }
    }, [isMember, router, workspaceId]);

    // Redirect to sign in if not authenticated
    useEffect(() => {
        if (!authLoading && !userId) {
            router.push("/auth");
        }
    }, [userId, authLoading, router]);

    const handleComplete = (value: string) => {
        mutate({
            workspaceId: workspaceId as Id<"workspaces">,
            joinCode: value,
        }, {
            onSuccess: (id) => {
                router.replace(`/workspace/${id}`);
                toast.success("Workspace joined successfully");
            },
            onError: (err) => {
                const errorMsg = err?.message || "Failed to join workspace. Please try again.";
                setLastError(errorMsg);
                toast.error(errorMsg);
            }
        });
    };

    useEffect(() => {
        if (code.length === 6 && !isPending) {
            handleComplete(code);
        }
    }, [code, isPending]);
    
    if (!workspaceId) {
        return <div>Error: Workspace ID is missing.</div>;
    }

    if (isLoading || authLoading) {
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
            <div className="w-full space-y-3">
                {lastError && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-900 border border-red-200">
                        {lastError}
                    </div>
                )}
                <Input
                    value={code}
                    onChange={(event) => {
                        const next = event.target.value
                            .replace(/\s+/g, "")
                            .toUpperCase()
                            .slice(0, 6);
                        setCode(next);
                        setLastError(null);
                    }}
                    placeholder="Enter 6-character code"
                    className={cn(
                        "uppercase tracking-[0.5em] text-center text-lg font-medium",
                        isPending && "opacity-50 pointer-not-allowed"
                    )}
                    disabled={isPending}
                    autoFocus
                />
                <Button
                    className="w-full"
                    disabled={isPending || code.length !== 6}
                    onClick={() => handleComplete(code)}
                >
                    {isPending ? "Joining..." : "Join workspace"}
                </Button>
            </div>
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