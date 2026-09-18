import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BlindSpot — AI Competitive-Programming Coach",
  description:
    "Analyze LeetCode & Codeforces submissions, detect recurring algorithmic failure patterns, and eliminate blind spots with targeted spaced repetition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="antialiased bg-[#0A0A0A] text-[#FAFAF8] min-h-screen font-sans selection:bg-[#1B1BFF] selection:text-[#FAFAF8]">
        {children}
      </body>
    </html>
  );
}
