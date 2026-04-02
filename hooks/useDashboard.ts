"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { buildDailySeries } from "@/utils/dashboard";

export function useDashboard(user: any) {
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
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  }, [user]);

  return {
    profile,
    partnerProfile,
    myLogs,
    partnerLogs,
    myGoals,
    partnerGoals,
    latestMessage,
    streak,
    summary,
    mySeries,
    partnerSeries,
    loadDashboard,
    setLatestMessage,
  };
}