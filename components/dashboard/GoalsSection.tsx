"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function GoalsSection({
  myGoals,
  partnerGoals,
  partnerProfile,
}: {
  myGoals: any[];
  partnerGoals: any[];
  partnerProfile: any;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [localGoals, setLocalGoals] = useState(myGoals);

  // ✅ IMPORTANT: keep local state in sync with parent updates
  useEffect(() => {
    setLocalGoals(myGoals);
  }, [myGoals]);

  // Start editing
  const handleEditStart = (goal: any) => {
    setEditingId(goal.id);
    setEditText(goal.text);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setEditText("");
  };

  // Save edit
  const handleSave = async (id: string) => {
    if (!editText.trim()) return;

    const { error } = await supabase
      .from("goals")
      .update({ text: editText })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    // update UI instantly
    setLocalGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, text: editText } : g))
    );

    setEditingId(null);
    setEditText("");
  };

  // Delete goal
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this goal?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("goals").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setLocalGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* YOUR GOALS */}
      <div className="card">
        <h2 className="section-title">Your Focus</h2>

        {localGoals.length === 0 ? (
          <p className="text-gray-500 text-[13px] italic">
            No goals yet — start by adding one.
          </p>
        ) : (
          localGoals.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between mb-2"
            >
              {editingId === g.id ? (
                <div className="flex gap-2 w-full">
                  <input
                    className="border p-1 text-[13px] w-full"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                  />

                  <button
                    onClick={() => handleSave(g.id)}
                    className="text-green-600 text-sm"
                  >
                    ✔
                  </button>

                  <button
                    onClick={handleCancel}
                    className="text-gray-500 text-sm"
                  >
                    ✖
                  </button>
                </div>
              ) : (
                <>
                  <p
                    className="text-[13px] cursor-pointer"
                    onClick={() => handleEditStart(g)}
                  >
                    • {g.text}
                  </p>

                  <button
                    onClick={() => handleDelete(g.id)}
                    className="text-red-500 text-xs ml-2"
                  >
                    🗑
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* PARTNER GOALS */}
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
  );
}