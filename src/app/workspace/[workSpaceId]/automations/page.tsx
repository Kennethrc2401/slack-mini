"use client";

import { useMemo, useState } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useGetAutomations } from "@/features/automations/api/use-get-automations";
import { AutomationSetupForm } from "@/features/automations/components/automation-setup-form";
import { AutomationEditForm } from "@/features/automations/components/automation-edit-form";
import { AutomationItem } from "@/features/automations/components/automation-item";
import type { Doc } from "@convex/_generated/dataModel";
import { Bolt, CalendarDays, MessageSquareText, Sparkles, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const templates = [
  {
    id: "daily-standup",
    title: "Daily standup reminder",
    description: "Post a reminder each weekday at 9:00 AM in #general.",
    tag: "Scheduling",
  },
  {
    id: "new-member-welcome",
    title: "New member welcome",
    description: "Send a welcome message when someone joins the workspace.",
    tag: "Onboarding",
  },
  {
    id: "mentions-tracker",
    title: "Mentions tracker",
    description: "Log every @mention in a channel to an activity feed.",
    tag: "Notifications",
  },
  {
    id: "calendar-follow-up",
    title: "Calendar follow-up",
    description: "Ping attendees 10 minutes before a meeting starts.",
    tag: "Calendar",
  },
];

const AutomationsPage = () => {
  const workspaceId = useWorkspaceId();
  const { data: workspace } = useGetWorkspace({ id: workspaceId });
  const { data: automations } = useGetAutomations({ workspaceId });
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [editingAutomation, setEditingAutomation] = useState<Doc<"automations"> | null>(null);

  const activeAutomations = useMemo(() => {
    return automations?.filter((a) => a.isActive).length ?? 0;
  }, [automations]);

  const draftAutomations = useMemo(() => {
    return automations?.filter((a) => !a.isActive).length ?? 0;
  }, [automations]);

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Bolt size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Automations</h1>
            <p className="text-sm text-muted-foreground">
              Build lightweight workflows for workspace {workspace?.name ?? "your workspace"}.
            </p>
          </div>
        </div>
        <Button className="w-full sm:w-auto" disabled>
          Create automation
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Active automations</div>
          <div className="mt-2 text-2xl font-semibold">{activeAutomations}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Drafts</div>
          <div className="mt-2 text-2xl font-semibold">{draftAutomations}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Templates</div>
          <div className="mt-2 text-2xl font-semibold">{templates.length}</div>
        </div>
      </div>

      {selectedTemplate && selectedTemplateData && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Set up {selectedTemplateData.title}</h2>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>
          <AutomationSetupForm
            workspaceId={workspaceId}
            automationType={selectedTemplate}
            onSuccess={() => setSelectedTemplate(null)}
          />
        </div>
      )}

      {editingAutomation && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Edit automation</h2>
            <button
              onClick={() => setEditingAutomation(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>
          <AutomationEditForm
            workspaceId={workspaceId}
            automation={editingAutomation}
            onSuccess={() => setEditingAutomation(null)}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Suggested templates</h2>
            <span className="text-xs text-muted-foreground">Quick starts</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {templates.map((template) => (
              <div key={template.id} className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="size-3" />
                  {template.tag}
                </div>
                <h3 className="mt-2 text-sm font-semibold">{template.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  Use template
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">What you can automate</h2>
            <div className="mt-3 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MessageSquareText className="size-4 text-indigo-600" />
                <span>Send messages on triggers like keywords, mentions, or time of day.</span>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="size-4 text-indigo-600" />
                <span>Sync reminders with your calendar or event schedule.</span>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="size-4 text-indigo-600" />
                <span>Route updates between channels to keep teams aligned.</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Active automations</h2>
            {automations && automations.length > 0 ? (
              <div className="mt-3 space-y-2">
                {automations.map((automation) => (
                  <AutomationItem
                    key={automation._id}
                    automation={automation}
                    onEdit={setEditingAutomation}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No automations created yet. Use a template to get started!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationsPage;
