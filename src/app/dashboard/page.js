"use server";
import { NextResponse } from "next/server";
import Dashboard from "@/app/dashboard/DashboardClient";
import {cookies} from "next/headers";
import { Suspense } from 'react'
async function fetchData() {
    try {
        const cookieStore = await cookies();

        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/fetchEvents`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
              "Cookie": cookieStore
          },
        });
        const data = await response.json();
        return data.rows;
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
      }
}

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
export default async function dashboard(){
    const events = await fetchData();
    return(
        <Suspense fallback={<LoadingSpinner/>}>
            <Dashboard APIEvents={events}/>
        </Suspense>

    )
}