"use client";

import { formatTime } from "@/utils/dashboard";

export default function StatsCards({
  streak,
  myLogs,
  partnerLogs,
  onOpenMyLogs,
  onOpenPartnerLogs,
}: {
  streak: number;
  myLogs: any[];
  partnerLogs: any[];
  onOpenMyLogs: () => void;
  onOpenPartnerLogs: () => void;
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  const myTodayTotal = myLogs
    .filter((l) => l.date === todayStr)
    .reduce((s, l) => s + l.duration, 0);

  const partnerTodayTotal = partnerLogs
    .filter((l) => l.date === todayStr)
    .reduce((s, l) => s + l.duration, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* STREAK */}
      <div className="card">
        <p className="card-title">Streak</p>
        <h2 className="text-3xl font-bold tracking-tight text-orange-400">
          🔥 {streak} days
        </h2>

        {streak === 0 && (
          <p className="text-[12px] text-red-400 mt-2">
            You’re about to lose your streak. Log something today.
          </p>
        )}
      </div>

      {/* YOUR TIME (CLICKABLE) */}
      <div
        onClick={onOpenMyLogs}
        className="card cursor-pointer hover:scale-[1.02] transition"
      >
        <p className="card-title">Your Time Today</p>
        <h2 className="text-3xl font-bold tracking-tight text-indigo-400">
          {formatTime(myTodayTotal)}
        </h2>

        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-400"
            style={{
              width: `${Math.min((myTodayTotal / 300) * 100, 100)}%`,
            }}
          />
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Click to view logs →
        </p>
      </div>

      {/* PARTNER TIME (CLICKABLE) */}
      <div
        onClick={onOpenPartnerLogs}
        className="card cursor-pointer hover:scale-[1.02] transition"
      >
        <p className="card-title">Partner Time</p>
        <h2 className="text-3xl font-bold tracking-tight text-green-400">
          {formatTime(partnerTodayTotal)}
        </h2>

        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400"
            style={{
              width: `${Math.min((partnerTodayTotal / 300) * 100, 100)}%`,
            }}
          />
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Click to view logs →
        </p>
      </div>
    </div>
  );
}