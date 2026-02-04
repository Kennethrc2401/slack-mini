"use client";

import { useMemo } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useGetChannelsWithMeta } from "@/features/channels/api/use-get-channels-with-meta";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Hash, Plus, Users, MessageSquareText, Search, Filter } from "lucide-react";

const ChannelsPage = () => {
  const workspaceId = useWorkspaceId();
  const { data: workspace } = useGetWorkspace({ id: workspaceId });
  const { data: channels, isLoading } = useGetChannelsWithMeta({ workspaceId });
  const router = useRouter();

  const stats = useMemo(() => {
    const total = channels?.length ?? 0;
    const withActivity = channels?.filter((channel) => channel.lastMessageAt).length ?? 0;
    return {
      total,
      private: 0,
      public: total,
      withActivity,
    };
  }, [channels]);

  const formatRelative = (timestamp: number | null) => {
    if (!timestamp) return "No messages yet";
    const diffMs = Date.now() - timestamp;
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Hash size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Channels</h1>
            <p className="text-sm text-muted-foreground">
              Browse channels in {workspace?.name ?? "your workspace"}.
            </p>
          </div>
        </div>
        <Button className="w-full sm:w-auto gap-2" disabled>
          <Plus size={18} />
          Create channel
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Total channels</div>
          <div className="mt-2 text-2xl font-semibold">{stats.total}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Channels with activity</div>
          <div className="mt-2 text-2xl font-semibold">{stats.withActivity}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Public</div>
          <div className="mt-2 text-2xl font-semibold">{stats.public}</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm"
              placeholder="Search channels..."
              disabled
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Filter size={16} />
            Filters
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {isLoading && (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              Loading channels...
            </div>
          )}
          {!isLoading && (channels?.length ?? 0) === 0 && (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              No channels found in this workspace.
            </div>
          )}
          {channels?.map((channel) => (
            <div key={channel._id} className="rounded-lg border p-3 hover:bg-muted/40">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Hash className="size-4 text-emerald-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">#{channel.name}</h3>
                      <span className="text-[10px] px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                        public
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">No topic set</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        {channel.memberCount} members
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquareText size={14} />
                        {formatRelative(channel.lastMessageAt)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-700">
                      {channel.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/workspace/${workspaceId}/channel/${channel._id}`)}
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
        <h2 className="text-lg font-semibold mb-2">What you can do in Channels</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <Hash className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>Create public or private channels for projects and teams.</span>
          </div>
          <div className="flex gap-2">
            <Users className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>Invite members and manage channel permissions.</span>
          </div>
          <div className="flex gap-2">
            <MessageSquareText className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>Keep conversations organized by topic or initiative.</span>
          </div>
          <div className="flex gap-2">
            <Hash className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>Use private channels for sensitive discussions.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelsPage;
