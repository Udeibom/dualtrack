"use client";

import Link from "next/link";
import { useAuth } from "@/app/providers";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/30 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-lg font-semibold tracking-tight">
          DuoTango
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <Link href="/" className="hover:text-white transition">
            Dashboard
          </Link>
          <Link href="/logs/new" className="hover:text-white transition">
            Log
          </Link>
          <Link href="/tasks/new" className="hover:text-white transition">
            Task
          </Link>
          <Link href="/goals/new" className="hover:text-white transition">
            Goal
          </Link>
          <Link href="/link" className="hover:text-white transition">
            Link
          </Link>
        </div>

        {/* Right Side (Auth) */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden sm:block text-sm text-gray-400">
              {user.email}
            </span>
          )}

          <button className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition text-sm font-medium">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}