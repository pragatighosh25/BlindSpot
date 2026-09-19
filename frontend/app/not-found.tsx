import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4 font-mono">
      <h2 className="text-2xl font-bold mb-2">404 - Page Not Found</h2>
      <p className="text-xs text-white/50 mb-6">The requested page does not exist.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-[#E4007C] text-white text-xs font-bold rounded-xl shadow hover:bg-[#c20069] transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
