"use client";

import { useMemo } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PlugZap, Link2, ShieldCheck, AlertTriangle } from "lucide-react";

const mockConnections = [
  {
    id: "conn-1",
    name: "Google Drive",
    status: "Connected",
    owner: "Alice Chen",
    lastSynced: "5 min ago",
    scope: "Files & Search",
  },
  {
    id: "conn-2",
    name: "Zoom",
    status: "Connected",
    owner: "Bob Smith",
    lastSynced: "Today",
    scope: "Meetings & Huddles",
  },
  {
    id: "conn-3",
    name: "GitHub",
    status: "Attention",
    owner: "Diana Lee",
    lastSynced: "Yesterday",
    scope: "Notifications",
  },
  {
    id: "conn-4",
    name: "Notion",
    status: "Disconnected",
    owner: "Grace Kim",
    lastSynced: "Jan 30",
    scope: "Knowledge Base",
  },
];

const statusBadge = (status: string) => {
  switch (status) {
    case "Connected":
      return "bg-green-100 text-green-700";
    case "Attention":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const ExternalConnectionsPage = () => {
  const workspaceId = useWorkspaceId();
  const { data: workspace } = useGetWorkspace({ id: workspaceId });

  const stats = useMemo(() => {
    return {
      total: mockConnections.length,
      connected: mockConnections.filter((c) => c.status === "Connected").length,
      attention: mockConnections.filter((c) => c.status === "Attention").length,
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <PlugZap size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">External Connections</h1>
            <p className="text-sm text-muted-foreground">
              Manage integrations for {workspace?.name ?? "your workspace"}.
            </p>
          </div>
        </div>
        <Button className="w-full sm:w-auto gap-2" disabled>
          <Link2 size={18} />
          Add connection
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Total connections</div>
          <div className="mt-2 text-2xl font-semibold">{stats.total}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Connected</div>
          <div className="mt-2 text-2xl font-semibold">{stats.connected}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Needs attention</div>
          <div className="mt-2 text-2xl font-semibold">{stats.attention}</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Connected apps</h2>
          <Button variant="outline" size="sm" disabled>
            Manage
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {mockConnections.map((conn) => (
            <div key={conn.id} className="rounded-lg border p-3 hover:bg-muted/40">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-muted/50 flex items-center justify-center">
                    <PlugZap className="size-4 text-sky-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{conn.name}</h3>
                      <span className={`text-[10px] px-2 py-1 rounded ${statusBadge(conn.status)}`}>
                        {conn.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{conn.scope}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Last synced {conn.lastSynced}</span>
                      <span>Owner: {conn.owner}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px] bg-sky-100 text-sky-700">
                      {conn.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" disabled>
                    Configure
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-sky-50 to-blue-50 p-6">
        <h2 className="text-lg font-semibold mb-2">Why connect external tools?</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <ShieldCheck className="size-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <span>Centralize access with secure, scoped permissions.</span>
          </div>
          <div className="flex gap-2">
            <Link2 className="size-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <span>Sync files, meetings, and updates into Slack.</span>
          </div>
          <div className="flex gap-2">
            <AlertTriangle className="size-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <span>Get alerts when integrations need attention.</span>
          </div>
          <div className="flex gap-2">
            <PlugZap className="size-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <span>Extend workflows with your favorite tools.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalConnectionsPage;
