"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/providers";
import { usePlanner } from "@/hooks/usePlanner";
import { motion } from "framer-motion";

type PlanType = "monthly" | "weekly" | "daily";

export default function PlannerPage() {
  const { user } = useAuth();

  const [type, setType] = useState<PlanType>("monthly");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const { plan, loadPlan, savePlan, loading } = usePlanner(user, type, date);

  const [items, setItems] = useState<any[]>([]);
  const [focus, setFocus] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadPlan();
  }, [user, type, date]);

  useEffect(() => {
    if (plan) {
      setItems(plan.tasks || []);
      setFocus(plan.focus || "");
    } else {
      setItems([]);
      setFocus("");
    }
  }, [plan]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), title: "", done: false },
    ]);
  };

  const updateItem = (id: number, value: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, title: value } : i))
    );
  };

  const toggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, done: !i.done } : i
      )
    );
  };

  const save = async () => {
    setSaving(true);
    const res = await savePlan({ focus, tasks: items });
    setSaving(false);

    if (res?.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    }
  };

  const titleMap = {
    monthly: "Monthly Plan",
    weekly: "Weekly Breakdown",
    daily: "Daily Execution",
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Planner</h1>
        <p className="text-sm text-gray-500">
          Plan your month → break into weeks → execute daily
        </p>
      </div>

      {/* FLOW INDICATOR */}
      <div className="flex items-center gap-2 text-sm">
        {["monthly", "weekly", "daily"].map((t, i) => (
          <div key={t} className="flex items-center gap-2">
            <button
              onClick={() => setType(t as PlanType)}
              className={`px-3 py-1 rounded-full transition ${
                type === t
                  ? "bg-black text-white"
                  : "bg-gray-100"
              }`}
            >
              {t}
            </button>
            {i < 2 && <span>→</span>}
          </div>
        ))}
      </div>

      {/* DATE + STATUS */}
      <div className="flex items-center justify-between">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        {loading && <span className="text-sm">Loading...</span>}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-600 text-sm"
          >
            ✅ Plan saved successfully
          </motion.div>
        )}
      </div>

      {/* MAIN CARD */}
      <div className="bg-white shadow rounded-2xl p-5 space-y-4">

        <h2 className="text-lg font-medium">{titleMap[type]}</h2>

        {/* FOCUS */}
        <input
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder={
            type === "monthly"
              ? "What matters this month?"
              : type === "weekly"
              ? "Top priorities this week"
              : "Today's main focus"
          }
          className="w-full px-3 py-2 border rounded"
        />

        {/* ITEMS */}
        <div className="space-y-2">
          {items.length === 0 && (
            <p className="text-sm text-gray-400">
              No items yet. Start by adding one.
            </p>
          )}

          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="text-lg"
              >
                {item.done ? "✅" : "⬜"}
              </button>

              <input
                value={item.title}
                onChange={(e) =>
                  updateItem(item.id, e.target.value)
                }
                className={`flex-1 px-2 py-1 border rounded ${
                  item.done ? "line-through text-gray-400" : ""
                }`}
                placeholder={
                  type === "daily"
                    ? "Task"
                    : "Goal / milestone"
                }
              />
            </motion.div>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-between">
          <button
            onClick={addItem}
            className="text-sm px-3 py-1 rounded bg-gray-100"
          >
            + Add item
          </button>

          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 rounded bg-black text-white"
          >
            {saving ? "Saving..." : "Save Plan"}
          </button>
        </div>
      </div>

      {/* VIEW EXISTING */}
      {plan && (
        <div className="text-sm text-gray-500">
          Last updated plan loaded ✔
        </div>
      )}
    </div>
  );
}
