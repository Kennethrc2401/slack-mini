"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import { Sidebar } from "./sidebar";
import { Toolbar } from "./toolbar";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { usePanel } from "@/hooks/use-panel";
import { NotificationProvider } from "@/components/notification-provider";
 
import { Loader } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Thread } from "@/features/messages/components/thread";
import { Profile } from "@/features/members/components/profile";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface WorkspaceIdLayoutProps {
    children: React.ReactNode;
}

const WorkspaceIdLayout = ({ children }: WorkspaceIdLayoutProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { parentMessageId, profileMemberId, onClose } = usePanel();

  const showPanel = !!parentMessageId || !!profileMemberId;

  // Check if user is authenticated
  useEffect(() => {
    const userId = localStorage.getItem("auth-user-id");
    if (!userId) {
      router.push("/auth");
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="h-full">
          <Toolbar />
          <div className="flex h-[calc(100vh-40px)]">
              <Sidebar />
              <ResizablePanelGroup
                direction="horizontal"
                autoSaveId={"ca-workspace-layout"}
              >
                <ResizablePanel
                  defaultSize={20}
                  minSize={11}
                  className="bg-[#5E2C5F]"
                >
                  <WorkspaceSidebar />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel minSize={20} defaultSize={80}>
                  {children}
                </ResizablePanel>
                {showPanel && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={29} minSize={20}>
                      {parentMessageId ? (
                        <Thread 
                          messageId={parentMessageId as Id<"messages">}
                          onClose={() => onClose()}
                        />
                      ): profileMemberId ? (
                        <Profile 
                          memberId={profileMemberId as Id<"members">}
                          onClose={() => onClose()}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Loader className="size-5 animate-spin text-muted-foreground" />
                        </div>

                      )}
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
          </div>
      </div>
    </NotificationProvider>
  );
};

export default WorkspaceIdLayout;