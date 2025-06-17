"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignOutButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const { isSignedIn, user } = useUser();
  const [eventName, setEventName] = useState("");
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user) return;

    async function fetchEvents() {
      try {
        const response = await fetch("/api/fetchEvents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.emailAddresses[0].emailAddress,
          }),
        });
        const data = await response.json();
        setEvents(data.rows);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [isSignedIn, user]);

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
          userId: user.id,
          email: user.emailAddresses[0].emailAddress,
          name: eventName,
        }),
      });
      const data = await response.json();
      if (data.error) {
        alert("Error creating event: " + data.error);
      } else {
        setEvents((prevEvents) => [
          ...prevEvents,
          { id: data.rows[0].id, name: eventName, dateadded: new Date().toISOString() },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-12 border border-white/20">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse border-t-indigo-400"></div>
          </div>
          <p className="text-slate-600 font-medium text-base sm:text-lg">Loading events...</p>
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-16 px-4">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
        <svg
          className="w-12 h-12 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-2">No Events Yet</h3>
      <p className="text-slate-500 text-base sm:text-lg mb-6">Create your first event to get started with attendance tracking</p>
      <button
        onClick={() => setShowNewEventForm(true)}
        className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create Your First Event
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <SignedIn>
        <div className="fixed top-4 right-4 z-50">
          <SignOutButton className="Btn">
            <div className="flex items-center gap-2">
              <div className="sign">
                <svg viewBox="0 0 512 512">
                  <path
                    d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
                  ></path>
                </svg>
              </div>
              <span className="text">Logout</span>
            </div>
          </SignOutButton>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12 px-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
                My Events
              </h1>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto px-2">
                Manage your events and track attendance with ease
              </p>
            </div>

            <div className="flex justify-center mb-8 px-2">
              <button
                onClick={() => setShowNewEventForm(true)}
                className="inline-flex items-center px-4 py-2 sm:px-8 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                New Event
              </button>
            </div>

            {events.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8">
                <EmptyState />
              </div>
            ) : (
              <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-white/20 bg-gradient-to-r from-slate-50/50 to-blue-50/50">
                  <div className="flex flex-col sm:flex-row items-center justify-between px-2">
                    <div className="mb-4 sm:mb-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Event List</h2>
                      <p className="text-slate-600 text-sm sm:text-base mt-1">
                        {events.length} events created
                      </p>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 text-center">
                      Click any event to manage attendees
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="grid gap-4">
                    {[...events]
                      .sort((a, b) => b.id - a.id)
                      .map((event) => (
                        <div
                          key={event.id}
                          className="group bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/30 hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:bg-white/60"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {event.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 group-hover:text-blue-700 transition-colors duration-200">
                                  {event.name}
                                </h3>
                                <p className="text-slate-500 text-xs sm:text-sm">
                                  Event ID: {event.id}
                                </p>
                                <p className="text-slate-500 text-xs sm:text-sm">
                                  Date Added:{" "}
                                  {new Date(event.dateadded).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={async () => {
                                  if (
                                    confirm(
                                      "Are you sure you want to delete this event?"
                                    )
                                  ) {
                                    try {
                                      setIsDeletingEvent(true);
                                      const response = await fetch(
                                        "/api/deleteEvent",
                                        {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            id: event.id,
                                            userId: user.id,
                                            email:
                                              user.emailAddresses[0].emailAddress,
                                          }),
                                        }
                                      );
                                      const data = await response.json();
                                      setIsDeletingEvent(false);
                                      if (data.error) {
                                        alert("Failed to delete event.");
                                      } else {
                                        setEvents((prevEvents) =>
                                          prevEvents.filter(
                                            (e) => e.id !== event.id
                                          )
                                        );
                                      }
                                    } catch (error) {
                                      alert("Error deleting event.");
                                    }
                                  }
                                }}
                                className="disabled:opacity-50 inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg group-hover:shadow-xl text-xs sm:text-sm"
                                disabled={isDeletingEvent}
                              >
                                <svg
                                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Delete
                              </button>
                              <button
                                onClick={() => router.push(`/event/${event.id}`)}
                                className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg group-hover:shadow-xl text-xs sm:text-sm"
                              >
                                <svg
                                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                View Event
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-12 max-w-md w-full text-center border border-white/20">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
              Welcome to RollWise
            </h1>
            <p className="text-slate-600 text-base sm:text-lg mb-8 leading-relaxed px-2">
              Smart attendance tracking made simple. Sign in to manage your events and track participation effortlessly.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-2 sm:py-4 px-4 sm:px-8 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </SignedOut>

      {showNewEventForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md border border-white/20 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6 px-2">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                  Create New Event
                </h2>
                <p className="text-slate-600 text-base sm:text-lg">
                  Give your event a memorable name
                </p>
              </div>

              <div className="mb-6 px-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Event Name</label>
                <input
                  className="w-full p-2 sm:p-4 border-2 border-slate-200 text-slate-800 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/60 backdrop-blur-sm text-sm sm:text-base"
                  type="text"
                  placeholder="Enter event name..."
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleNewEvent()}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 px-2">
                <button
                  className="flex-1 px-4 py-2 sm:px-6 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-30 text-sm sm:text-base"
                  onClick={handleNewEvent}
                  disabled={isCreatingEvent}
                >
                  Create Event
                </button>
                <button
                  className="flex-1 px-4 py-2 sm:px-6 sm:py-4 bg-gradient-to-r from-slate-400 to-slate-500 text-white font-semibold rounded-2xl hover:from-slate-500 hover:to-slate-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                  onClick={() => setShowNewEventForm(false)}
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