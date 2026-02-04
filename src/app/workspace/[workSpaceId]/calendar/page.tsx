"use client";

import React, { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useGetEvents } from "@/features/events/api/use-get-events";
import { useCreateEvent } from "@/features/events/api/use-create-event";
import { useUpdateEvent } from "@/features/events/api/use-update-event";
import { useDeleteEvent } from "@/features/events/api/use-delete-event";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Id } from "../../../../../convex/_generated/dataModel";
import { CalendarDays, Edit, Trash } from "lucide-react";
import { Hint } from "@/components/hint";

const CalendarPage = () => {
  const workspaceId = useWorkspaceId();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const fallbackDate = useMemo(() => new Date(), []);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [showEvents, setShowEvents] = useState(false);

  const { data: events, isLoading } = useGetEvents(workspaceId, selectedDate ?? fallbackDate);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const handleAddOrUpdateEvent = () => {
    if (!eventTitle || !eventDescription) {
      alert("Please enter both title and description.");
      return;
    }

    if (editingEventId) {
      updateEvent(editingEventId as Id<"events">, {
        workspaceId,
        title: eventTitle,
        description: eventDescription,
        date: selectedDate ? selectedDate.toISOString() : undefined,
      });
      setEditingEventId(null);
    } else {
      createEvent(workspaceId, eventTitle, eventDescription, selectedDate || new Date());
    }
    setEventTitle("");
    setEventDescription("");
  };

  const handleEditEvent = (eventId: string, title: string = "", description: string = "") => {
    setEditingEventId(eventId);
    setEventTitle(title);
    setEventDescription(description);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(workspaceId, eventId as Id<"events">);
  };

  const eventCount = (date: Date) => {
    return events?.filter(event => new Date(event.date).toDateString() === date.toDateString()).length || 0;
  };

  const handleDateClick = (value: Date | Date[]) => {
    setSelectedDate(value as Date);
    setShowEvents(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <CalendarDays size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Calendar</h1>
            <p className="text-sm text-muted-foreground">
              Plan events and keep your workspace in sync.
            </p>
          </div>
        </div>
        {selectedDate && (
          <div className="text-sm text-muted-foreground">
            Selected: <span className="font-medium text-foreground">{selectedDate.toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-lg font-semibold">Month view</h2>
            <span className="text-xs text-muted-foreground">Click a date to view events</span>
          </div>
          <div className="rounded-xl border bg-muted/30 p-3">
            <Calendar
              onChange={(value) => handleDateClick(value as Date)}
              value={selectedDate}
              tileContent={({ date, view }) => {
                if (view === "month") {
                  const count = eventCount(date);
                  return count > 0 ? (
                    <Hint label={`${count} ${count === 1 ? "event" : "events"}`}>
                      <div className="mt-1 flex justify-center">
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      </div>
                    </Hint>
                  ) : null;
                }
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Create event</h2>
            <p className="text-xs text-muted-foreground">Add details and save to the selected date.</p>
            <div className="mt-3 space-y-3">
              <input
                type="text"
                placeholder="Event Title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddOrUpdateEvent()}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <textarea
                placeholder="Event Description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddOrUpdateEvent()}
                className="h-24 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                onClick={handleAddOrUpdateEvent}
                className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {editingEventId ? "Update Event" : "Add Event"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Events</h2>
              <span className="text-xs text-muted-foreground">
                {selectedDate ? selectedDate.toLocaleDateString() : "Pick a date"}
              </span>
            </div>
            <div className="mt-3 max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {!showEvents ? (
                <p className="text-sm text-muted-foreground">Select a date to see events.</p>
              ) : isLoading ? (
                <p className="text-sm text-muted-foreground">Loading events...</p>
              ) : (
                events
                  ?.filter(event => new Date(event.date).toDateString() === selectedDate?.toDateString())
                  .map(event => (
                    <div key={event._id} className="rounded-xl border bg-muted/20 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold">{event.title}</h3>
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleEditEvent(event._id, event.title, event.description)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event._id)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                          >
                            <Trash size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
