"use client";

import { useState, useMemo } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Plus, Clock, Users } from "lucide-react";

// Mock data for demonstration
const mockActiveHuddles = [
  {
    id: "huddle-1",
    title: "Product Team Sync",
    startedAt: new Date(Date.now() - 12 * 60000), // 12 minutes ago
    participants: [
      { id: "user-1", name: "Alice Chen", avatar: "AC" },
      { id: "user-2", name: "Bob Smith", avatar: "BS" },
      { id: "user-3", name: "Carol White", avatar: "CW" },
    ],
  },
  {
    id: "huddle-2",
    title: "Design Review",
    startedAt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    participants: [
      { id: "user-4", name: "Diana Lee", avatar: "DL" },
      { id: "user-5", name: "Evan Brown", avatar: "EB" },
    ],
  },
];

const mockPastHuddles = [
  {
    id: "huddle-3",
    title: "Engineering Standup",
    startedAt: new Date(Date.now() - 2 * 3600000), // 2 hours ago
    endedAt: new Date(Date.now() - 1.75 * 3600000),
    participants: [
      { id: "user-1", name: "Alice Chen", avatar: "AC" },
      { id: "user-6", name: "Frank Miller", avatar: "FM" },
      { id: "user-7", name: "Grace Kim", avatar: "GK" },
    ],
  },
  {
    id: "huddle-4",
    title: "1:1 with Manager",
    startedAt: new Date(Date.now() - 4 * 3600000), // 4 hours ago
    endedAt: new Date(Date.now() - 3.9 * 3600000),
    participants: [
      { id: "user-2", name: "Bob Smith", avatar: "BS" },
      { id: "user-8", name: "Henry Davis", avatar: "HD" },
    ],
  },
  {
    id: "huddle-5",
    title: "Client Call",
    startedAt: new Date(Date.now() - 24 * 3600000), // 1 day ago
    endedAt: new Date(Date.now() - 23.5 * 3600000),
    participants: [
      { id: "user-3", name: "Carol White", avatar: "CW" },
      { id: "user-4", name: "Diana Lee", avatar: "DL" },
      { id: "user-5", name: "Evan Brown", avatar: "EB" },
      { id: "user-9", name: "Iris Johnson", avatar: "IJ" },
    ],
  },
];

const formatDuration = (startTime: Date, endTime?: Date): string => {
  const now = new Date();
  const end = endTime || now;
  const diffMs = end.getTime() - startTime.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const HuddleCard = ({
  huddle,
  isActive,
}: {
  huddle: (typeof mockActiveHuddles)[0] | (typeof mockPastHuddles)[0];
  isActive: boolean;
}) => {
  const duration = formatDuration(
    huddle.startedAt,
    "endedAt" in huddle ? huddle.endedAt : undefined
  );
  const timeStr = formatTime(huddle.startedAt);
  const dateStr = formatDate(huddle.startedAt);

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{huddle.title}</h3>
            {isActive && (
              <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Live
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              {duration}
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} />
              {huddle.participants.length} participant{huddle.participants.length !== 1 ? "s" : ""}
            </div>
            <div>{dateStr} at {timeStr}</div>
          </div>
        </div>
        {isActive && (
          <Button size="sm" className="gap-2">
            <Phone size={16} />
            Join
          </Button>
        )}
      </div>

      <div className="mt-3 flex -space-x-2">
        {huddle.participants.slice(0, 5).map((participant) => (
          <Avatar key={participant.id} className="h-8 w-8 border-2 border-white">
            <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
              {participant.avatar}
            </AvatarFallback>
          </Avatar>
        ))}
        {huddle.participants.length > 5 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-semibold text-gray-700">
            +{huddle.participants.length - 5}
          </div>
        )}
      </div>
    </div>
  );
};

const HuddlesPage = () => {
  const workspaceId = useWorkspaceId();
  const { data: workspace } = useGetWorkspace({ id: workspaceId });

  const activeCount = mockActiveHuddles.length;
  const totalCount = mockActiveHuddles.length + mockPastHuddles.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Phone size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Huddles</h1>
            <p className="text-sm text-muted-foreground">
              Quick audio and video calls in {workspace?.name ?? "your workspace"}.
            </p>
          </div>
        </div>
        <Button className="w-full sm:w-auto gap-2" disabled>
          <Plus size={18} />
          Start huddle
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Active huddles</div>
          <div className="mt-2 text-2xl font-semibold">{activeCount}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Total huddles</div>
          <div className="mt-2 text-2xl font-semibold">{totalCount}</div>
        </div>
      </div>

      {activeCount > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Active now</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {mockActiveHuddles.map((huddle) => (
              <HuddleCard key={huddle.id} huddle={huddle} isActive={true} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent huddles</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {mockPastHuddles.map((huddle) => (
            <HuddleCard key={huddle.id} huddle={huddle} isActive={false} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <h2 className="text-lg font-semibold mb-2">What you can do in Huddles</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <Phone className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>Start quick voice or video calls with team members.</span>
          </div>
          <div className="flex gap-2">
            <Users className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>Group huddles for team syncs and standups.</span>
          </div>
          <div className="flex gap-2">
            <Clock className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>Automatic recording and transcription coming soon.</span>
          </div>
          <div className="flex gap-2">
            <Phone className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>Screen sharing and collaborative features.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HuddlesPage;
