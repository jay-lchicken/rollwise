"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {SignedIn, SignedOut, SignOutButton, useUser} from "@clerk/nextjs";

export default function Dashboard({APIEvents}) {
    const [events, setEvents] = useState(APIEvents || []);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [showNewEventForm, setShowNewEventForm] = useState(false);
    const {isSignedIn, user} = useUser();
    const [eventName, setEventName] = useState("");
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    const [isDeletingEvent, setIsDeletingEvent] = useState(false);
    const [openEntering, setOpenEntering] = useState(false);
    const [eventCode, setEventCode] = useState("");

    const handleNewEvent = async () => {
        setIsCreatingEvent(true);
        if (!eventName.trim()) {
            alert("Event name cannot be empty");
            setIsCreatingEvent(false);
            return;
        }
        try {
            const response = await fetch("/api/addEvent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: eventName,
                }),
            });
            const data = await response.json();
            if (data.error) {
                alert("Error creating event: " + data.error);
            } else {
                setEvents((prevEvents) => [
                    ...prevEvents,
                    {id: data.rows[0].id, name: eventName, dateadded: new Date().toISOString()},
                ]);
                setEventName("");
                setShowNewEventForm(false);
            }
        } catch (error) {
            console.error("Failed to create event:", error);
        } finally {
            setIsCreatingEvent(false);
        }
    };

    const LoadingSpinner = () => (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-8">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="w-10 h-10 border-2 border-slate-700 rounded-full animate-spin border-t-blue-500"></div>
                    </div>
                    <p className="text-slate-300 font-medium">Loading events...</p>
                </div>
            </div>
        </div>
    );

    const EmptyState = () => (
        <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">No Events Created</h3>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">Start managing attendance by creating your first event</p>
            <button
                onClick={() => setShowNewEventForm(true)}
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all duration-200 shadow-lg shadow-blue-600/25"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Create Event
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950">
            <SignedIn>
                {/* Modern Header */}
                <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">RollWise</h1>
                                    <p className="text-slate-400 text-xs">Event Management</p>
                                </div>
                            </div>
                            <SignOutButton>
                                <button className="inline-flex items-center px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                    </svg>
                                    Sign Out
                                </button>
                            </SignOutButton>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner/>
                ) : (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Modern Page Header */}
                        <div className="mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
                                    <p className="text-slate-400 text-lg">Manage events and track attendance</p>
                                </div>
                                <div className="flex items-center gap-3 mt-4 sm:mt-0">
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500">Total Events</p>
                                        <p className="text-2xl font-bold text-white">{events.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modern Action Bar */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button
                                onClick={() => setShowNewEventForm(true)}
                                className="group inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/30 hover:scale-[1.02]"
                            >
                                <div className="w-5 h-5 mr-3 rounded-md bg-blue-500 flex items-center justify-center group-hover:bg-blue-400 transition-colors">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                    </svg>
                                </div>
                                Create New Event
                            </button>
                            <button
                                onClick={() => setOpenEntering(true)}
                                className="group inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/30 hover:scale-[1.02]"
                            >
                                <div className="w-5 h-5 mr-3 rounded-md bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-400 transition-colors">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                                    </svg>
                                </div>
                                Mark Attendance
                            </button>
                        </div>

                        {events.length === 0 ? (
                            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-8">
                                <EmptyState/>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...events]
                                    .sort((a, b) => b.id - a.id)
                                    .map((event) => (
                                        <div
                                            key={event.id}
                                            className="group bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-900/50"
                                        >
                                            {/* Event Header */}
                                            <div className="p-6 border-b border-slate-800">
                                                <div className="flex items-center space-x-4 mb-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                                                        <span className="text-white font-bold text-lg">
                                                            {event.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                                                            {event.name}
                                                        </h3>
                                                        <p className="text-slate-500 text-sm">Event #{event.id}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-slate-400 text-sm">Status</span>
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-800">
                                                            <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                                                            Active
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-slate-400 text-sm">Created</span>
                                                        <span className="text-slate-300 text-sm font-medium">
                                                            {new Date(event.dateadded).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="p-6 space-y-3">
                                                <button
                                                    onClick={() => router.push(`/event/${event.id}`)}
                                                    className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-all duration-200 shadow-lg shadow-blue-600/20"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    </svg>
                                                    Manage Event
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm("Are you sure you want to delete this event?")) {
                                                            try {
                                                                setIsDeletingEvent(true);
                                                                const response = await fetch("/api/deleteEvent", {
                                                                    method: "POST",
                                                                    headers: {"Content-Type": "application/json"},
                                                                    body: JSON.stringify({id: event.id}),
                                                                });
                                                                const data = await response.json();
                                                                setIsDeletingEvent(false);
                                                                if (data.error) {
                                                                    alert("Failed to delete event.");
                                                                } else {
                                                                    setEvents((prevEvents) =>
                                                                        prevEvents.filter((e) => e.id !== event.id)
                                                                    );
                                                                }
                                                            } catch (error) {
                                                                alert("Error deleting event.");
                                                            }
                                                        }
                                                    }}
                                                    disabled={isDeletingEvent}
                                                    className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 disabled:opacity-50"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                    </svg>
                                                    {isDeletingEvent ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                )}
            </SignedIn>

            <SignedOut>
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-3">RollWise</h1>
                        <p className="text-slate-400 text-lg mb-8">Professional attendance management platform</p>
                        <button
                            onClick={() => router.push("/")}
                            className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-xl hover:bg-blue-500 transition-all duration-200 shadow-lg shadow-blue-600/25"
                        >
                            Sign In to Continue
                        </button>
                    </div>
                </div>
            </SignedOut>

            {/* Modern New Event Modal */}
            {showNewEventForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">Create Event</h3>
                                </div>
                                <button
                                    onClick={() => setShowNewEventForm(false)}
                                    className="text-slate-400 hover:text-white transition-colors p-1"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-3">Event Name</label>
                                <input
                                    className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-500"
                                    type="text"
                                    placeholder="Enter event name"
                                    value={eventName}
                                    onChange={(e) => setEventName(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleNewEvent()}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleNewEvent}
                                    disabled={isCreatingEvent}
                                    className="flex-1 bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20"
                                >
                                    {isCreatingEvent ? "Creating..." : "Create Event"}
                                </button>
                                <button
                                    onClick={() => setShowNewEventForm(false)}
                                    className="flex-1 bg-slate-700 text-slate-300 font-medium py-2.5 px-4 rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modern Mark Attendance Modal */}
            {openEntering && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">Mark Attendance</h3>
                                </div>
                                <button
                                    onClick={() => setOpenEntering(false)}
                                    className="text-slate-400 hover:text-white transition-colors p-1"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-3">Event Code</label>
                                <input
                                    className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-500"
                                    type="text"
                                    placeholder="Enter event code"
                                    value={eventCode}
                                    onChange={(e) => setEventCode(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            if (!eventCode.trim()) {
                                                alert("Event code cannot be empty");
                                                return;
                                            }
                                            router.push("/scan/" + eventCode);
                                        }
                                    }}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        if (!eventCode.trim()) {
                                            alert("Event code cannot be empty");
                                            return;
                                        }
                                        router.push("/scan/" + eventCode);
                                    }}
                                    className="flex-1 bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
                                >
                                    Submit
                                </button>
                                <button
                                    onClick={() => setOpenEntering(false)}
                                    className="flex-1 bg-slate-700 text-slate-300 font-medium py-2.5 px-4 rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}