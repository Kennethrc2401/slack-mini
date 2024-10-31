"use client";

import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useGetEvents } from "@/features/events/api/ue-get-events";
import { useCreateEvent } from "@/features/events/api/use-create-event";
import { useUpdateEvent } from "@/features/events/api/use-update-event";
import { useDeleteEvent } from "@/features/events/api/use-delete-event";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Edit, Trash } from "lucide-react";

const CalendarPage = () => {
    const workspaceId = useWorkspaceId();

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [eventTitle, setEventTitle] = useState("");
    const [eventDescription, setEventDescription] = useState("");
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    const { data: events, isLoading } = useGetEvents(workspaceId, selectedDate || new Date());
    const createEvent = useCreateEvent();
    const updateEvent = useUpdateEvent();
    const deleteEvent = useDeleteEvent();

    const handleAddOrUpdateEvent = () => {
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

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Calendar</h1>
            
            <div className="mt-4">
                <Calendar
                    onChange={(date) => setSelectedDate(date as Date)}
                    value={selectedDate}
                    tileContent={({ date, view }) => {
                        if (view === "month") {
                            const event = events?.find((event) => 
                                new Date(event.date).toDateString() === date.toDateString()
                            );
                            return event ? <p className="text-blue-500">{event.title}</p> : null;
                        }
                    }}
                />
            </div>

            <div className="mt-4">
                <input
                    type="text"
                    placeholder="Event Title"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="border p-2 rounded mt-2 w-full"
                />
                <textarea
                    placeholder="Event Description"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    className="border p-2 rounded mt-2 w-full"
                />
                <button
                    onClick={handleAddOrUpdateEvent}
                    className="bg-blue-500 text-white p-2 rounded mt-2"
                >
                    {editingEventId ? "Update Event" : "Add Event"}
                </button>
            </div>

            <div className="mt-4">
                {isLoading ? (
                    <p>Loading events...</p>
                ) : (
                    events?.map((event) => (
                        <div key={event._id} className="border-b p-2">
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
        </div>
    );
};

export default CalendarPage;
