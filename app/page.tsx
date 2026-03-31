"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/providers";
import MessageInput from "@/components/MessageInput";
import ComparisonChart from "@/components/ComparisonChart";

export default function Home() {
  const { user, loading } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);

  const [myLogs, setMyLogs] = useState<any[]>([]);
  const [partnerLogs, setPartnerLogs] = useState<any[]>([]);

  const [myGoals, setMyGoals] = useState<any[]>([]);
  const [partnerGoals, setPartnerGoals] = useState<any[]>([]);

  const [latestMessage, setLatestMessage] = useState<any>(null);

  const [streak, setStreak] = useState<number | null>(null);
  const [summary, setSummary] = useState("");

  const [mySeries, setMySeries] = useState<any[]>([]);
  const [partnerSeries, setPartnerSeries] = useState<any[]>([]);

  const today = new Date().toISOString().split("T")[0];

  const buildDailySeries = (logs: any[]) => {
    const map: any = {};

    logs.forEach((log) => {
      const d = log.date;

      if (!map[d]) {
        map[d] = { date: d, growth: 0, waste: 0, neutral: 0 };
      }

      const category = log.tasks?.category || "neutral";
      map[d][category] += log.duration;
    });

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];

      result.push(
        map[key] || { date: key, growth: 0, waste: 0, neutral: 0 }
      );
    }

    return result;
  };

  const loadDashboard = useCallback(async () => {
    if (!user) return;

    try {
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!myProfile) return;

      setProfile(myProfile);

      const { data: logs } = await supabase
        .from("logs")
        .select(`*, tasks:task_id (name, category)`)
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(5);

      setMyLogs(logs || []);

      const { data: allLogs } = await supabase
        .from("logs")
        .select("date")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (allLogs) {
        const uniqueDates = [...new Set(allLogs.map((l) => l.date))];

        let count = 0;
        for (let i = 0; i < uniqueDates.length; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);

          if (uniqueDates.includes(d.toISOString().split("T")[0])) {
            count++;
          } else break;
        }

        setStreak(count);
      }

      const { data: goals } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id);

      setMyGoals(goals || []);

      const last7 = new Date();
      last7.setDate(last7.getDate() - 6);

      const { data: weekLogs } = await supabase
        .from("logs")
        .select(`*, tasks:task_id (name, category)`)
        .eq("user_id", user.id)
        .gte("date", last7.toISOString().split("T")[0]);

      if (weekLogs && weekLogs.length > 0) {
        let total = 0;
        const categories: any = { growth: 0, waste: 0 };
        const tasks: any = {};

        weekLogs.forEach((log) => {
          total += log.duration;

          if (log.tasks?.category === "growth") {
            categories.growth += log.duration;
          }

          if (log.tasks?.category === "waste") {
            categories.waste += log.duration;
          }

          if (log.tasks?.name) {
            tasks[log.tasks.name] =
              (tasks[log.tasks.name] || 0) + log.duration;
          }
        });

        const topTask = Object.keys(tasks).reduce((a, b) =>
          tasks[a] > tasks[b] ? a : b
        );

        setSummary(`
You spent ${(total / 60).toFixed(1)} hours this week.
Most of your time went into ${topTask}.
Growth: ${(categories.growth / 60).toFixed(1)}h,
Waste: ${(categories.waste / 60).toFixed(1)}h.
`);
      } else {
        setSummary("");
      }

      const { data: myWeek } = await supabase
        .from("logs")
        .select(`date, duration, tasks:task_id (category)`)
        .eq("user_id", user.id)
        .gte("date", last7.toISOString().split("T")[0]);

      let partnerWeek: any[] = [];

      if (myProfile.partner_id) {
        const { data: pWeek } = await supabase
          .from("logs")
          .select(`date, duration, tasks:task_id (category)`)
          .eq("user_id", myProfile.partner_id)
          .gte("date", last7.toISOString().split("T")[0]);

        partnerWeek = pWeek || [];
      }

      setMySeries(buildDailySeries(myWeek || []));
      setPartnerSeries(buildDailySeries(partnerWeek || []));

      if (myProfile.partner_id) {
        const { data: partner } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", myProfile.partner_id)
          .single();

        setPartnerProfile(partner);

        const { data: pLogs } = await supabase
          .from("logs")
          .select(`*, tasks:task_id (name, category)`)
          .eq("user_id", myProfile.partner_id)
          .order("date", { ascending: false })
          .limit(5);

        setPartnerLogs(pLogs || []);

        const { data: pGoals } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", myProfile.partner_id);

        setPartnerGoals(pGoals || []);

        const { data: messages } = await supabase
          .from("messages")
          .select("*")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${myProfile.partner_id}),and(sender_id.eq.${myProfile.partner_id},receiver_id.eq.${user.id})`
          )
          .order("created_at", { ascending: false })
          .limit(1);

        if (messages?.length) setLatestMessage(messages[0]);
      } else {
        setPartnerProfile(null);
        setPartnerLogs([]);
        setPartnerGoals([]);
        setLatestMessage(null);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  }, [user, today]);

  useEffect(() => {
    if (!user || loading) return;
    loadDashboard();
  }, [user, loading, loadDashboard]);

  // ✅ Landing/Auth Screen
  if (!user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-3xl font-bold">Welcome to DualTrack</h1>

        <p className="text-gray-500 text-sm">
          Track your time. Stay accountable. Grow together.
        </p>

        <div className="flex gap-3 mt-4">
          <a href="/auth/login" className="px-4 py-2 bg-black text-white rounded">
            Login
          </a>

          <a href="/auth/signup" className="px-4 py-2 border rounded">
            Sign Up
          </a>
        </div>
      </div>
    );
  }

  if (loading || !user || streak === null) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 animate-pulse">
        <div className="h-8 w-40 bg-white/10 rounded mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="h-24 bg-white/10 rounded-2xl" />
          <div className="h-24 bg-white/10 rounded-2xl" />
          <div className="h-24 bg-white/10 rounded-2xl" />
        </div>

        <div className="h-40 bg-white/10 rounded-2xl mb-6" />
        <div className="h-40 bg-white/10 rounded-2xl" />
      </div>
    );
  }

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const myTodayTotal = myLogs
    .filter((l) => l.date === todayStr)
    .reduce((s, l) => s + l.duration, 0);

  const hasLoggedToday = myTodayTotal > 0;

  const partnerTodayTotal = partnerLogs
    .filter((l) => l.date === todayStr)
    .reduce((s, l) => s + l.duration, 0);

  const partnerHasLoggedToday = partnerTodayTotal > 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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

        <div className="card">
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
        </div>

        <div className="card">
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
        </div>
      </div>

      {!hasLoggedToday && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-400">
              {!partnerHasLoggedToday
                ? "You both haven’t logged today"
                : `${partnerProfile?.name || "Your partner"} already logged today`}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {!partnerHasLoggedToday
                ? "One of you should break the silence."
                : "Catch up before the day ends."}
            </p>
          </div>

          <a
            href="/logs/new"
            className="text-xs px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Log now
          </a>
        </div>
      )}

      {latestMessage && (
        <div className="card mb-8">
          <p className="card-title">💌 Today’s Note</p>
          <p className="text-[13px] text-gray-300 leading-relaxed">
            {latestMessage.text}
          </p>
        </div>
      )}

      {profile?.partner_id && (
        <div className="border p-4 mb-4 rounded">
          <p className="text-[13px] text-gray-500">Chat with partner</p>
        </div>
      )}

      {profile?.partner_id && (
        <div className="card mb-8">
          <p className="card-title mb-3">Drop a note</p>

          <MessageInput
            partnerId={profile.partner_id}
            onMessageSent={(msg) => setLatestMessage(msg)}
          />
        </div>
      )}

      {summary && (
        <div className="card mb-8">
          <p className="card-title">This week</p>
          <p className="text-[13px] leading-relaxed text-gray-300 whitespace-pre-line">
            {summary}
          </p>
        </div>
      )}

      {profile?.partner_id && mySeries.length > 0 && (
        <div className="card mb-8">
          <p className="text-[13px] text-gray-400 mb-2">
            Last 7 days performance
          </p>

          <div className="flex gap-4 text-[12px] text-gray-400 mb-3">
            <span className="text-indigo-400">● You</span>
            <span className="text-green-400">● Partner</span>
          </div>

          <p className="card-title mb-4">Weekly Comparison</p>

          <ComparisonChart
            myData={mySeries}
            partnerData={partnerSeries}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="section-title">Your Focus</h2>

          {myGoals.length === 0 ? (
            <p className="text-gray-500 text-[13px] italic">
              No goals yet — start by adding one.
            </p>
          ) : (
            myGoals.map((g) => (
              <p key={g.id} className="text-[13px] mb-1">
                • {g.text}
              </p>
            ))
          )}
        </div>

        <div className="card">
          <h2 className="section-title">
            {partnerProfile?.name || "Partner"}’s Focus
          </h2>

          {partnerGoals.length === 0 ? (
            <p className="text-gray-500 text-[13px] italic">
              No goals yet — start by adding one.
            </p>
          ) : (
            partnerGoals.map((g) => (
              <p key={g.id} className="text-[13px] mb-1">
                • {g.text}
              </p>
            ))
          )}
        </div>
      </div>

      <div className="h-20 md:h-10" />
    </div>
  );
}