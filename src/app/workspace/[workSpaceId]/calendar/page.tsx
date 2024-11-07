"use client";

import React, { useState } from "react";
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
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [showEvents, setShowEvents] = useState(false);

  const { data: events, isLoading } = useGetEvents(workspaceId, selectedDate || new Date());
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
    <div className="p-6">
      <h1 className="text-2xl font-bold flex">
        <CalendarDays size={24} className="mr-2" />
        Calendar
      </h1>

      {/* Input Section */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Event Title"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddOrUpdateEvent()}
          className="border p-2 rounded mt-2 w-full"
        />
        <textarea
          placeholder="Event Description"
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddOrUpdateEvent()}
          className="border p-2 rounded mt-2 w-full"
        />
        <button
          onClick={handleAddOrUpdateEvent}
          className="bg-blue-500 text-white p-2 rounded mt-2"
        >
          {editingEventId ? "Update Event" : "Add Event"}
        </button>
      </div>

      {/* Calendar */}
      <div className="mt-4">
        <Calendar
          onChange={(value) => handleDateClick(value as Date)}
          value={selectedDate}
          tileContent={({ date, view }) => {
            if (view === "month") {
              const count = eventCount(date);
              return count > 0 ? (
                <Hint
                  label={`${count} ${count === 1 ? "event" : "events"}`}
                >
                  <p className="text-gray-400">{count} {count === 1 ? "event" : "events"}</p>
                </Hint>
              ) : null;
            }
          }}
        />
      </div>

      {/* Events List */}
      {showEvents && (
        <div className="mt-4 max-h-96 overflow-y-auto border p-4 rounded shadow-lg">
          <h2 className="text-xl font-bold">Events on {selectedDate?.toLocaleDateString()}</h2>
          {isLoading ? (
            <p>Loading events...</p>
          ) : (
            events
              ?.filter(event => new Date(event.date).toDateString() === selectedDate?.toDateString())
              .map(event => (
                <div key={event._id} className="border p-4 rounded shadow-lg my-2">
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  <p className="text-gray-700">{event.description}</p>
                  <p className="text-sm text-gray-500">Date: {new Date(event.date).toLocaleDateString()}</p>
                  <button
                    onClick={() => handleEditEvent(event._id, event.title, event.description)}
                    className="text-blue-500 mr-2 flex items-center"
                  >
                    <Edit size={16} className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="text-red-500 flex items-center"
                  >
                    <Trash size={16} className="mr-1" /> Delete
                  </button>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
