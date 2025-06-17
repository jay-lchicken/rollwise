"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {SignedIn, SignedOut, SignInButton, SignOutButton, useUser} from "@clerk/nextjs";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);
  const [eventExists, setEventExists] = useState(true);
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [eventName, setEventName] = useState("");
  const [eventDetails, setEventDetails] = useState(null);
  const params = useParams();
  const eventId = params.eventID;

  useEffect(() => {
    if (!isSignedIn || !user) return;
    const fetchEvents = async () => {
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
        } else {
          setEventName(data.rows.name);
          setEventDetails(data.rows);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setEventExists(false);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isSignedIn, user]);

  const handleMarkAttendance = async () => {
    if (!eventName.trim()) {
      return;
    }

    setMarking(true);

    try {
      const response = await fetch("/api/markAttendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: eventId,
          email: user.emailAddresses[0].emailAddress,
          name: user.fullName,
        }),
      });
      const data = await response.json();

      if (data.error) {
        alert("Error marking attendance: " + data.error);
      } else {
        setMarked(true);
        setTimeout(() => {
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      alert("Failed to mark attendance. Please try again.");
    } finally {
      setMarking(false);
    }
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Loading event details...</span>
    </div>
  );

  const EventNotFound = () => (
    <div className="flex flex-col items-center text-center py-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Event Not Found</h2>
      <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or may have been removed.</p>
    </div>
  );
  const SuccessCheckmark = () => (
      <div className="flex flex-col items-center animate-pulse">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-green-700 font-semibold text-lg">Attendance Marked!</p>
      <p className="text-gray-600 text-sm mt-1">Thank you for attending</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <SignedIn>
          <div className="fixed top-4 right-4 z-50">
  <SignOutButton className="Btn">
    <div className="flex items-center gap-2">
      <div className="sign">
        <svg viewBox="0 0 512 512">
          <path
            d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z">
          </path>
        </svg>
      </div>
      <span className="text">Logout</span>
    </div>
  </SignOutButton>
</div>
          {loading ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                <LoadingSpinner />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 hover:shadow-2xl">
                {!eventExists ? (
                  <EventNotFound />
                ) : marked ? (
                  <div className="text-center py-8">
                    <SuccessCheckmark />
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h1 className="text-2xl font-bold text-gray-800 mb-2">Mark Attendance</h1>
                      <p className="text-gray-600">Confirm your presence at this event</p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
                      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Event Details
                      </h2>
                      <p className="text-gray-700 font-medium text-lg">{eventName}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        ATTENDEE INFORMATION
                      </h3>
                      <p className="text-gray-800 font-medium">{user?.fullName}</p>
                      <p className="text-gray-600 text-sm">{user?.emailAddresses[0]?.emailAddress}</p>
                    </div>

                    <button
                      onClick={handleMarkAttendance}
                      disabled={marking}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all duration-300 transform ${
                        marking
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                      }`}
                    >
                      {marking ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Marking Attendance...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Mark My Attendance
                        </div>
                      )}
                    </button>

                    <p className="text-center text-gray-500 text-xs mt-6">
                      By marking attendance, you confirm your presence at this event
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </SignedIn>

        <SignedOut>
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Welcome to <span className="text-blue-600">RollWise</span>
              </h1>

              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Your smart attendance tracking solution. Sign in to mark your attendance and join the event.
              </p>

              <SignInButton mode="modal">
                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In to Continue
                  </div>
                </button>
              </SignInButton>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-500 text-sm">
                  New to RollWise? Sign up is quick and easy!
                </p>
              </div>
            </div>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}