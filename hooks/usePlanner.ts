"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function usePlanner(user: any) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const loadPlan = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    if (error) {
      console.error("Load plan error:", error);
    }

    if (data) {
      setPlan(data);
    } else {
      setPlan(null);
    }

    setLoading(false);
  }, [user, today]);

  const savePlan = useCallback(
    async (payload: any) => {
      if (!user) return { success: false };

      const { error } = await supabase.from("plans").upsert(
        {
          user_id: user.id,
          date: today,
          ...payload,
        },
        {
          onConflict: "user_id,date",
        }
      );

      if (error) {
        console.error("Save plan error:", error);
        return { success: false, error };
      }

      await loadPlan();

      return { success: true };
    },
    [user, today, loadPlan]
  );

  return {
    plan,
    loading,
    loadPlan,
    savePlan,
  };
}