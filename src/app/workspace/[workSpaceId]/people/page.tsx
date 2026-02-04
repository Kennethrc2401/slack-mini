"use client";

import { useMemo } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Users, UserPlus, Shield, Briefcase } from "lucide-react";

const statusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700";
    case "Away":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const PeoplePage = () => {
  const workspaceId = useWorkspaceId();
  const { data: workspace } = useGetWorkspace({ id: workspaceId });
  const { data: members, isLoading } = useGetMembers({ workspaceId });

  const stats = useMemo(() => {
    const total = members?.length ?? 0;
    const admins = members?.filter((member) => member.role === "admin").length ?? 0;
    return {
      total,
      active: total,
      admins,
    };
  }, [members]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">People</h1>
            <p className="text-sm text-muted-foreground">
              Manage members in {workspace?.name ?? "your workspace"}.
            </p>
          </div>
        </div>
        <Button className="w-full sm:w-auto gap-2" disabled>
          <UserPlus size={18} />
          Invite people
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Total members</div>
          <div className="mt-2 text-2xl font-semibold">{stats.total}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Active now</div>
          <div className="mt-2 text-2xl font-semibold">{stats.active}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Admins</div>
          <div className="mt-2 text-2xl font-semibold">{stats.admins}</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm"
              placeholder="Search people..."
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
              Loading people...
            </div>
          )}
          {!isLoading && (members?.length ?? 0) === 0 && (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              No members found in this workspace.
            </div>
          )}
          {members?.map((member) => {
            const name = member.user?.name ?? member.user?.email ?? "Unknown user";
            const initials = name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const title = member.user?.email ?? "Workspace member";
            const status = "Active";

            return (
              <div key={member._id} className="rounded-lg border p-3 hover:bg-muted/40">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs bg-rose-100 text-rose-700">
                      {initials}
                    </AvatarFallback>
                    {member.user?.image && (
                      <AvatarImage src={member.user.image} alt={name} />
                    )}
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{name}</h3>
                      <span className={`text-[10px] px-2 py-1 rounded ${statusBadge(status)}`}>
                        {status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Briefcase size={12} />
                      <span>{title}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.role === "admin" && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-indigo-100 text-indigo-700">
                      <Shield size={12} />
                      Admin
                    </span>
                  )}
                  <Button variant="outline" size="sm" disabled>
                    View profile
                  </Button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-rose-50 to-pink-50 p-6">
        <h2 className="text-lg font-semibold mb-2">What you can do in People</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <Users className="size-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>Browse everyone in the workspace and see their roles.</span>
          </div>
          <div className="flex gap-2">
            <UserPlus className="size-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>Invite new members and manage access.</span>
          </div>
          <div className="flex gap-2">
            <Shield className="size-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>Assign admins and manage permissions.</span>
          </div>
          <div className="flex gap-2">
            <Briefcase className="size-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>Track teams, roles, and titles.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeoplePage;
