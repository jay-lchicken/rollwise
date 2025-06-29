import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import HomePage from "@/app/Home";
import { Suspense } from "react";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <Suspense>
      <HomePage />
    </Suspense>
  );
}