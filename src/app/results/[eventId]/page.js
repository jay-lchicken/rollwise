"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {SignedIn, SignedOut, SignOutButton, useUser} from "@clerk/nextjs";
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

    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/getPublicPeople", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: eventId,
        }),
      });
        const data = await response.json();
        setPeople(data.rows)
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
      }
    };

    fetchEvents();
    const fetchDetails = async () => {
      try {
        const response = await fetch("/api/getEventDetails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventId: eventId
          }),
        });
        const data = await response.json();
        if (!data.rows || !data.rows.name) {
          setEventExists(false);
        }
        setIsPublic(data.rows.ispublic);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setEventExists(false);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [isSignedIn, user]);

  const EventNotFound = () => (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/40 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-rose-50/30 to-pink-50/50 rounded-3xl"></div>
          <div className="relative z-10">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 via-rose-100 to-red-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse shadow-lg"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-3">
              Event Not Found
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed text-sm sm:text-base">
              The event you're looking for doesn't exist or may have been removed from our system.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 sm:p-12 border border-white/40 max-w-sm w-full">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-pulse border-t-indigo-400"></div>
            <div className="absolute inset-2 w-16 h-16 border-2 border-violet-200 rounded-full animate-spin border-t-violet-500" style={{animationDirection: 'reverse'}}></div>
          </div>
          <div className="text-center">
            <p className="text-slate-700 font-semibold text-lg">Loading Event</p>
            <p className="text-slate-500 text-sm mt-1">Please wait a moment...</p>
          </div>
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12 sm:py-20">
      <div className="relative mb-8">
        <div className="w-24 sm:w-32 h-24 sm:h-32 mx-auto bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-12 sm:w-16 h-12 sm:h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">No Attendees Yet</h3>
      <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-base px-4">
        Your event is ready to go! Start building your attendee list by adding people below.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
      <div className="fixed top-4 right-4 z-50">
        <SignOutButton className="Btn">



          <div className="flex items-center gap-2 sm:gap-3">
            <div className={"sign"}>
              <svg viewBox="0 0 512 512">
              <path
                  d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
            </svg>
            </div>
            <div className="text">Logout</div>
          </div>
        </SignOutButton>
      </div>

      {!eventExists ? (
          <EventNotFound/>
      ) : loading ? (
          <LoadingSpinner/>
      ) : (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Event Dashboard
                </h1>
                <p className="text-slate-600 mt-2 text-sm sm:text-base">View attendees with ease</p>
              </div>
            </div>

            {people.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/40 p-4 sm:p-6 overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-slate-800">{people.length}</p>
                      <p className="text-slate-600 text-xs sm:text-sm">Total Attendees</p>
                    </div>
                  </div>
                </div>

                <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/40 p-4 sm:p-6 overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-slate-800">{people.filter(p => p.isattended).length}</p>
                      <p className="text-slate-600 text-xs sm:text-sm">Present</p>
                    </div>
                  </div>
                </div>

                <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/40 p-4 sm:p-6 overflow-hidden group hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-slate-800">{people.filter(p => !p.isattended).length}</p>
                      <p className="text-slate-600 text-xs sm:text-sm">Absent</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {people.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/40 p-6 sm:p-8">
              <EmptyState/>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/40 overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8 border-b border-white/30 bg-gradient-to-r from-slate-50/80 to-blue-50/80">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Attendee Registry</h2>
                    <p className="text-slate-600 mt-1 sm:mt-2 text-sm sm:text-lg">
                      {people.length} {people.length === 1 ? 'person' : 'people'} registered for this event
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm">
                    <div className="flex items-center bg-emerald-50 px-3 sm:px-4 py-2 rounded-full shadow-sm">
                      <div className="w-2 sm:w-3 h-2 sm:h-3 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-emerald-700 font-medium">Present</span>
                    </div>
                    <div className="flex items-center bg-red-50 px-3 sm:px-4 py-2 rounded-full shadow-sm">
                      <div className="w-2 sm:w-3 h-2 sm:h-3 bg-red-400 rounded-full mr-2"></div>
                      <span className="text-red-700 font-medium">Absent</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="block sm:hidden">
                  {people.map((person, index) => (
                    <div key={person.id} className="border-b border-slate-200/50 p-4 hover:bg-white/60 transition-all duration-200">
                      <div className="flex items-start space-x-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {person.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-slate-800 text-lg truncate">{person.name}</h3>
                            {person.isattended ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 shadow-sm flex-shrink-0">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                                Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 shadow-sm flex-shrink-0">
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></div>
                                Absent
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 font-medium text-sm mb-1 truncate">{person.email}</p>
                          <p className="text-slate-500 text-xs">
                            Updated: {new Date(person.dateadded).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <table className="w-full hidden sm:table">
                  <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                    <tr>
                      <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-left text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Attendee
                      </th>
                      <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-left text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50">
                    {people.map((person, index) => (
                      <tr key={person.id} className="hover:bg-white/60 transition-all duration-200 group">
                        <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                          <div className="flex items-center">
                            <div className="relative">
                              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg mr-3 sm:mr-4 shadow-lg group-hover:scale-110 transition-transform duration-200">
                                {person.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="font-semibold text-slate-800 text-base sm:text-lg">{person.name}</div>
                              <p className="text-slate-500 text-xs sm:text-sm">
                                Updated: {new Date(person.dateadded).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                          <div className="text-slate-700 font-medium text-sm sm:text-base">{person.email}</div>
                        </td>
                        <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center">
                          {person.isattended ? (
                            <span className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-emerald-100 text-emerald-800 shadow-sm">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                              Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-red-100 text-red-800 shadow-sm">
                              <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                              Absent
                            </span>
                          )}
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
    </div>
  );
}