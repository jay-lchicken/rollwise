"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { SignedIn, SignedOut, SignOutButton, useUser } from "@clerk/nextjs";
import QRCode from "react-qr-code";

export default function Home() {
  const [showQRCode, setShowQRCode] = useState(false);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPeopleForm, setShowNewPeopleForm] = useState(false);
  const [peopleInput, setPeopleInput] = useState("");
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [eventExists, setEventExists] = useState(true);
  const [isDeletingAttendee, setIsDeletingAttendee] = useState(false);
  const params = useParams();
  const eventId = params.eventId;
  const [attendeeEmail, setAttendeeEmail] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user) return;

    async function fetchEvents() {
      try {
        const response = await fetch("/api/fetchPeople", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            email: user.emailAddresses[0].emailAddress,
            eventId: eventId,
          }),
        });
        const data = await response.json();
        setPeople(data.rows);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    }

    async function fetchDetails() {
      try {
        const response = await fetch("/api/getEventDetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: eventId }),
        });
        const data = await response.json();
        if (!data.rows || !data.rows.name) {
          setEventExists(false);
        }
        setIsPublic(data.rows.ispublic);
      } catch (error) {
        console.error("Failed to fetch event details:", error);
        setEventExists(false);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
    fetchDetails();
  }, [isSignedIn, user]);

  const EventNotFound = () => (
    <div className="flex flex-col items-center text-center py-8 px-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
        Event Not Found
      </h2>
      <p className="text-gray-600 mb-6">
        The event you're looking for doesn't exist or may have been removed.
      </p>
    </div>
  );

  const handleAddPeople = async () => {
    const lines = peopleInput
      .split("\n")
      .filter((line) => line.trim() !== "");
    const peopleArray = lines.map((line, index) => {
      const [name, email] = line.split(",").map((s) => s.trim());
      if (!name || !email) {
        alert(`Invalid format on line ${index + 1}. Use: Name, Email`);
        throw new Error("Invalid input format");
      }
      return { name, email };
    });

    try {
      const response = await fetch("/api/addPeople", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventId,
          userId: user.id,
          email: user.emailAddresses[0].emailAddress,
          people: peopleArray,
        }),
      });

      const result = await response.json();
      if (result.error) {
        alert("Failed to add people: " + result.error);
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to add people:", err);
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
          <p className="text-slate-600 font-medium text-base sm:text-lg">
            Loading people...
          </p>
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-2">
        No People Added Yet
      </h3>
      <p className="text-slate-500 mb-6 text-sm sm:text-base">
        Start by adding people to your event
      </p>
      <button
        onClick={() => setShowNewPeopleForm(true)}
        className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Add Your First People
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <SignedIn>
        {/* **Logout button left exactly as-is** */}
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

        {!eventExists ? (
          <EventNotFound />
        ) : loading ? (
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
                Event Attendees
              </h1>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto px-2">
                Manage your event participants and track attendance in real-time
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 px-2">
              <button
                onClick={() => setShowNewPeopleForm(true)}
                className="inline-flex items-center px-4 py-2 sm:px-8 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Add People
              </button>

              <button
                onClick={() => setShowQRCode(true)}
                className="inline-flex items-center px-4 py-2 sm:px-8 sm:py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                Show QR Code
              </button>

              {isPublic ? (
                <div className="flex flex-col sm:flex-row gap-2 items-center justify-center px-2">
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to make the results private? This will hide the attendance results from the public."
                        )
                      ) {
                        setIsTogglingPublic(true);
                        fetch("/api/togglePublic", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            eventId: eventId,
                            userId: user.id,
                            email: user.emailAddresses[0].emailAddress,
                          }),
                        })
                          .then((res) => res.json())
                          .then((data) => {
                            if (data.error) {
                              alert("Failed to toggle public/private: " + data.error);
                            } else {
                              window.location.reload();
                            }
                          })
                          .catch((err) => {
                            alert("Error toggling public/private.");
                            console.error(err);
                          });
                      }
                    }}
                    className="disabled:opacity-20 inline-flex items-center px-4 py-2 sm:px-8 sm:py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                    disabled={isTogglingPublic}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14M12 5l7 7-7 7"
                      />
                    </svg>
                    Make Results Private
                  </button>

                  <button
                    className="copy"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          `${window.location.protocol}//${window.location.host}/results/${eventId}`
                        );
                      } catch (e) {
                        alert("Failed to copy link");
                      }
                    }}
                  >
                    <span
                      data-text-end="Copied!"
                      data-text-initial="Copy to clipboard published link"
                      className="tooltip"
                    ></span>
                    <span>
                      <svg
                        style={{ enableBackground: "new 0 0 512 512" }}
                        viewBox="0 0 6.35 6.35"
                        height="20"
                        width="20"
                        className="clipboard"
                      >
                        <g>
                          <path
                            fill="currentColor"
                            d="M2.43.265c-.3 0-.548.236-.573.53h-.328a.74.74 0 0 0-.735.734v3.822a.74.74 0 0 0 .735.734H4.82a.74.74 0 0 0 .735-.734V1.529a.74.74 0 0 0-.735-.735h-.328a.58.58 0 0 0-.573-.53zm0 .529h1.49c.032 0 .049.017.049.049v.431c0 .032-.017.049-.049.049H2.43c-.032 0-.05-.017-.05-.049V.843c0-.032.018-.05.05-.05zm-.901.53h.328c.026.292.274.528.573.528h1.49a.58.58 0 0 0 .573-.529h.328a.2.2 0 0 1 .206.206v3.822a.2.2 0 0 1-.206.205H1.53a.2.2 0 0 1-.206-.205V1.529a.2.2 0 0 1 .206-.206z"
                          ></path>
                        </g>
                      </svg>
                      <svg
                        style={{ enableBackground: "new 0 0 512 512" }}
                        viewBox="0 0 24 24"
                        height="18"
                        width="18"
                        className="checkmark"
                      >
                        <g>
                          <path
                            data-original="#000000"
                            fill="currentColor"
                            d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"
                          ></path>
                        </g>
                      </svg>
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to publish the results? This will make the attendance results public."
                      )
                    ) {
                      setIsTogglingPublic(true);
                      fetch("/api/togglePublic", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          eventId: eventId,
                          userId: user.id,
                          email: user.emailAddresses[0].emailAddress,
                        }),
                      })
                        .then((res) => res.json())
                        .then((data) => {
                          if (data.error) {
                            alert("Failed to toggle public/private: " + data.error);
                          } else {
                            window.location.reload();
                          }
                        })
                        .catch((err) => {
                          alert("Error toggling public/private.");
                          console.error(err);
                        });
                    }
                  }}
                  className="disabled:opacity-20 inline-flex items-center px-4 py-2 sm:px-8 sm:py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  disabled={isTogglingPublic}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Publish Results
                </button>
              )}
            </div>

            {people.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8">
                <EmptyState />
              </div>
            ) : (
              <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-white/20 bg-gradient-to-r from-slate-50/50 to-blue-50/50">
                  <div className="flex flex-col sm:flex-row items-center justify-between">
                    <div className="mb-4 sm:mb-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                        Attendee List
                      </h2>
                      <p className="text-slate-600 mt-1 text-sm sm:text-base">
                        {people.length} people registered
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 text-xs sm:text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                        <span className="text-slate-600">Present</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                        <span className="text-slate-600">Absent</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50">
                      {people.map((person) => (
                        <tr
                          key={person.id}
                          className="hover:bg-white/40 transition-colors duration-200"
                        >
                          <td className="px-4 sm:px-6 py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base mr-3">
                                {person.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <div className="font-medium text-slate-800 text-sm sm:text-base">
                                  {person.name}
                                </div>
                                <p className="text-slate-500 text-[10px] sm:text-xs">
                                  Date Updated:{" "}
                                  {new Date(person.dateadded).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 text-slate-600 text-xs sm:text-sm">
                            {person.email}
                          </td>
                          <td className="px-4 sm:px-6 py-3 text-center">
                            {person.isattended ? (
                              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-emerald-100 text-emerald-800">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>
                                Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800">
                                <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
                                Absent
                              </span>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-3">
                            <button
                              onClick={async () => {
                                if (
                                  confirm(
                                    "Are you sure you want to delete this attendee?"
                                  )
                                ) {
                                  try {
                                    setAttendeeEmail(person.email);
                                    setIsDeletingAttendee(true);
                                    const response = await fetch(
                                      "/api/deleteAttendee",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          id: eventId,
                                          userId: user.id,
                                          email:
                                            user.emailAddresses[0]
                                              .emailAddress,
                                          deleteEmail: person.email,
                                        }),
                                      }
                                    );
                                    const data = await response.json();
                                    setIsDeletingAttendee(false);
                                    if (data.error) {
                                      alert("Failed to delete event.");
                                    } else {
                                      window.location.reload();
                                    }
                                  } catch (error) {
                                    alert("Error deleting event.");
                                  }
                                }
                              }}
                              className="disabled:opacity-50 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-full hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                              disabled={
                                isDeletingAttendee &&
                                attendeeEmail === person.email
                              }
                            >
                              <svg
                                className="w-4 sm:w-5 h-4 sm:h-5"
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
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              Smart attendance tracking made simple. Sign in to manage your events.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </SignedOut>

      {showQRCode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md border border-white/20 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6 px-2">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
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
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                  Attendance QR Code
                </h2>
                <p className="text-slate-600 text-sm sm:text-base px-2">
                  Scan this code to mark attendance instantly
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-inner mb-6 flex items-center justify-center">
                <QRCode
                  value={`${window.location.protocol}//${window.location.host}/scan/${eventId}`}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  className="rounded-xl"
                />
              </div>

              <button
                onClick={() => setShowQRCode(false)}
                className="w-full py-3 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-slate-500 to-slate-600 text-white font-semibold rounded-2xl hover:from-slate-600 hover:to-slate-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewPeopleForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-lg border border-white/20 overflow-hidden">
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                  Add People
                </h2>
                <p className="text-slate-600 text-sm sm:text-base px-2">
                  Add participants to your event
                </p>
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-4 mb-6 border border-blue-100">
                <p className="text-sm text-slate-700 mb-2 font-medium">
                  Format Instructions:
                </p>
                <code className="text-sm bg-white/60 px-2 py-1 rounded-lg border text-black">
                  Name, Email
                </code>
                <p className="text-xs text-slate-500 mt-2">
                  Enter one person per line
                </p>
              </div>

              <textarea
                className="w-full h-40 sm:h-48 p-2 sm:p-4 border-2 border-slate-200 text-slate-800 rounded-2xl mb-6 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none bg-white/60 backdrop-blur-sm text-xs sm:text-sm"
                placeholder={`Jane Doe, jane@example.com${"\n"}John Smith, john@example.com`}
                value={peopleInput}
                onChange={(e) => setPeopleInput(e.target.value)}
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex-1 px-4 py-2 sm:px-6 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                  onClick={handleAddPeople}
                >
                  Add People
                </button>
                <button
                  className="flex-1 px-4 py-2 sm:px-6 sm:py-4 bg-gradient-to-r from-slate-400 to-slate-500 text-white font-semibold rounded-2xl hover:from-slate-500 hover:to-slate-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                  onClick={() => setShowNewPeopleForm(false)}
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