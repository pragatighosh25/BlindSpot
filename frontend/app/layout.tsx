import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="antialiased bg-[#0D0D0D] text-[#FAFAF8] min-h-screen font-sans selection:bg-[#1B1BFF] selection:text-[#FAFAF8]">
        {children}
      </body>
    </html>
  );
}
