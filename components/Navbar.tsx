"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/providers";

export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/30 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-lg font-semibold tracking-tight">
          DualTrack
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <Link href="/" className="hover:text-white transition">Dashboard</Link>
          <Link href="/logs/new" className="hover:text-white transition">Log</Link>
          <Link href="/tasks/new" className="hover:text-white transition">Task</Link>
          <Link href="/goals/new" className="hover:text-white transition">Goal</Link>
          <Link href="/link" className="hover:text-white transition">Link</Link>
          <Link href="/notes" className="hover:text-white transition">Notes</Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden sm:block text-sm text-gray-400">
              {user.email}
            </span>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-gray-300"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 text-sm text-gray-300">
          <Link href="/" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link href="/logs/new" onClick={() => setOpen(false)}>Log</Link>
          <Link href="/tasks/new" onClick={() => setOpen(false)}>Task</Link>
          <Link href="/goals/new" onClick={() => setOpen(false)}>Goal</Link>
          <Link href="/link" onClick={() => setOpen(false)}>Link</Link>
          <Link href="/notes" onClick={() => setOpen(false)}>Notes</Link>
        </div>
      )}
    </nav>
  );
}