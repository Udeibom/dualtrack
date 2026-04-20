"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function usePlanner(user: any, type: "daily" | "weekly" | "monthly", date: string) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadPlan = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date)
      .eq("type", type)
      .maybeSingle();

    if (error) console.error(error);

    if (data) {
      setPlan({
        ...data,
        tasks: typeof data.tasks === "string"
          ? JSON.parse(data.tasks)
          : data.tasks,
      });
    } else {
      setPlan(null);
    }

    setLoading(false);
  }, [user, date, type]);

  const savePlan = useCallback(async (payload: any) => {
    if (!user) return { success: false };

    const { error } = await supabase.from("plans").upsert(
      {
        user_id: user.id,
        date,
        type,
        ...payload,
      },
      {
        onConflict: "user_id,date,type",
      }
    );

    if (error) return { success: false };

    await loadPlan();
    return { success: true };
  }, [user, date, type, loadPlan]);

  return { plan, loading, loadPlan, savePlan };
}