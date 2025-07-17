import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RollWise",
  description: "The future of attendance tracking",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
        <html lang="en">

        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {children}
        </body>
        <script defer src="https://umami.techtime.coffee/script.js" data-website-id="0e0f1f77-d2a1-424f-ba1e-3c84428cb8b4"></script>
        </html>
    </ClerkProvider>
  );
}
