import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlindSpot — AI Competitive-Programming Coach",
  description:
    "Analyze LeetCode & Codeforces submissions, detect algorithmic failure patterns, and fix blind spots with targeted spaced repetition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#070b12] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
