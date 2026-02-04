"use client";

import { useMemo } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, Plus, Clock, Users, Star } from "lucide-react";

const mockCanvases = [
  {
    id: "canvas-1",
    title: "Product Vision & Roadmap",
    updatedAt: "Today",
    collaborators: ["Alice Chen", "Bob Smith", "Diana Lee"],
    status: "Pinned",
  },
  {
    id: "canvas-2",
    title: "Q1 OKRs",
    updatedAt: "Yesterday",
    collaborators: ["Grace Kim", "Henry Davis"],
    status: "Active",
  },
  {
    id: "canvas-3",
    title: "Design System Notes",
    updatedAt: "Jan 31",
    collaborators: ["Diana Lee", "Evan Brown", "Iris Johnson"],
    status: "Draft",
  },
  {
    id: "canvas-4",
    title: "Customer Research Summary",
    updatedAt: "Jan 29",
    collaborators: ["Carol White"],
    status: "Archived",
  },
];

const statusBadge = (status: string) => {
  switch (status) {
    case "Pinned":
      return "bg-amber-100 text-amber-700";
    case "Active":
      return "bg-green-100 text-green-700";
    case "Draft":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const CanvasesPage = () => {
  const workspaceId = useWorkspaceId();
  const { data: workspace } = useGetWorkspace({ id: workspaceId });

  const stats = useMemo(() => {
    return {
      total: mockCanvases.length,
      pinned: mockCanvases.filter((c) => c.status === "Pinned").length,
      drafts: mockCanvases.filter((c) => c.status === "Draft").length,
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Canvases</h1>
            <p className="text-sm text-muted-foreground">
              Shared docs and collaborative notes in {workspace?.name ?? "your workspace"}.
            </p>
          </div>
        </div>
        <Button className="w-full sm:w-auto gap-2" disabled>
          <Plus size={18} />
          New canvas
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Total canvases</div>
          <div className="mt-2 text-2xl font-semibold">{stats.total}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Pinned</div>
          <div className="mt-2 text-2xl font-semibold">{stats.pinned}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Drafts</div>
          <div className="mt-2 text-2xl font-semibold">{stats.drafts}</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent canvases</h2>
          <Button variant="outline" size="sm" disabled>
            View all
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {mockCanvases.map((canvas) => (
            <div key={canvas.id} className="rounded-lg border p-3 hover:bg-muted/40">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{canvas.title}</h3>
                    <span className={`text-[10px] px-2 py-1 rounded ${statusBadge(canvas.status)}`}>
                      {canvas.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      Updated {canvas.updatedAt}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {canvas.collaborators.length} collaborator{canvas.collaborators.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="mt-2 flex -space-x-2">
                    {canvas.collaborators.slice(0, 4).map((name) => (
                      <Avatar key={name} className="h-7 w-7 border-2 border-white">
                        <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">
                          {name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {canvas.collaborators.length > 4 && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-semibold text-gray-700">
                        +{canvas.collaborators.length - 4}
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
                  <Star size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
        <h2 className="text-lg font-semibold mb-2">What you can do in Canvases</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <FileText className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <span>Collaborate on docs, project plans, and meeting notes.</span>
          </div>
          <div className="flex gap-2">
            <Users className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <span>Invite teammates to edit and comment in real-time.</span>
          </div>
          <div className="flex gap-2">
            <Star className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <span>Pin important canvases to keep them easy to find.</span>
          </div>
          <div className="flex gap-2">
            <Clock className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <span>Track updates and see who edited last.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasesPage;
