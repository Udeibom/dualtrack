"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import { usePlanner } from "@/hooks/usePlanner";
import { useDashboard } from "@/hooks/useDashboard";
import { matchTasksToLogs } from "@/lib/matchTasksToLogs";
import { generateInsights } from "@/lib/generateInsights";

export default function PlannerPage() {
  const { user } = useAuth();
  const { plan, loadPlan, savePlan } = usePlanner(user);
  const { myLogs } = useDashboard(user);

  const [tasks, setTasks] = useState<any[]>([]);
  const [focus, setFocus] = useState("");
  const [reflection, setReflection] = useState("");
  const [message, setMessage] = useState(""); // ✅ ADDED

  useEffect(() => {
    if (!user) return;
    loadPlan();
  }, [user]);

  useEffect(() => {
    if (plan) {
      setTasks(plan.tasks || []);
      setFocus(plan.focus || "");
      setReflection(plan.reflection || "");
    }
  }, [plan]);

  const addTask = () => {
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "",
        time: "",
        priority: "medium",
        completed: false,
      },
    ]);
  };

  const updateTask = (id: number, field: string, value: any) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // ✅ UPDATED SAVE FUNCTION
  const save = async () => {
    const result = await savePlan({ tasks, focus, reflection });

    if (result?.success) {
      setMessage("✅ Plan saved successfully");
    } else {
      setMessage("❌ Failed to save plan");
    }

    // auto-clear after 3s
    setTimeout(() => setMessage(""), 3000);
  };

  // 🔥 MATCHING LOGIC
  const matchedTasks = matchTasksToLogs(tasks, myLogs || []);

  const matchedScore =
    tasks.length === 0
      ? 0
      : Math.round(
          (matchedTasks.filter((t) => t.matched).length / tasks.length) * 100
        );

  // Planner Score
  const plannerScore =
    tasks.length === 0
      ? 0
      : Math.round(
          (tasks.filter((t) => t.completed).length / tasks.length) * 100
        );

  // 🧠 AI INSIGHTS
  const insights = generateInsights({
    tasks,
    matchedTasks,
    logs: myLogs || [],
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <h1 className="text-2xl font-semibold">Planner (Execution System)</h1>

      {/* Focus */}
      <input
        value={focus}
        onChange={(e) => setFocus(e.target.value)}
        placeholder="Daily Focus"
        className="w-full px-3 py-2 bg-black border border-white/10 rounded"
      />

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const matched = matchedTasks.find((t) => t.id === task.id);

          return (
            <div key={task.id} className="space-y-1">
              <div className="grid md:grid-cols-5 gap-2">
                <input
                  value={task.title}
                  onChange={(e) =>
                    updateTask(task.id, "title", e.target.value)
                  }
                  placeholder="Task"
                  className="px-2 py-1 bg-black border border-white/10 rounded"
                />
                <input
                  value={task.time}
                  onChange={(e) =>
                    updateTask(task.id, "time", e.target.value)
                  }
                  placeholder="Time"
                  className="px-2 py-1 bg-black border border-white/10 rounded"
                />
                <select
                  value={task.priority}
                  onChange={(e) =>
                    updateTask(task.id, "priority", e.target.value)
                  }
                  className="px-2 py-1 bg-black border border-white/10 rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <button onClick={() => toggleTask(task.id)}>
                  {task.completed ? "Done" : "Mark"}
                </button>
              </div>

              {/* ✅ MATCH FEEDBACK */}
              <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                <span>{task.title || "Untitled task"}</span>
                <span>
                  {matched?.matched ? "✅ Matched" : "❌ Missed"}
                </span>
              </div>
            </div>
          );
        })}

        <button
          onClick={addTask}
          className="bg-white text-black px-4 py-2 rounded"
        >
          + Add Task
        </button>
      </div>

      {/* 🎯 UPDATED SCORE SYSTEM */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border p-4 rounded">
          <p className="text-sm text-gray-400">Planner Score</p>
          <p className="text-2xl">{plannerScore || 0}%</p>
        </div>

        <div className="border p-4 rounded">
          <p className="text-sm text-gray-400">Reality Score</p>
          <p className="text-2xl">{matchedScore}%</p>
        </div>

        <div className="border p-4 rounded">
          <p className="text-sm text-gray-400">Truth Gap</p>
          <p className="text-2xl">
            {Math.abs(matchedScore - (plannerScore || 0))}%
          </p>
        </div>
      </div>

      {/* 🧠 AI COACH UI */}
      <div className="border border-white/10 rounded p-4 space-y-2">
        <p className="text-sm text-gray-400">AI Reflection</p>

        {insights.length === 0 ? (
          <p className="text-sm text-gray-500">
            No strong patterns yet. Keep going.
          </p>
        ) : (
          insights.map((insight, i) => (
            <p key={i} className="text-sm">
              • {insight}
            </p>
          ))
        )}
      </div>

      {/* Reflection */}
      <textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder="Reflection"
        className="w-full px-3 py-2 bg-black border border-white/10 rounded"
      />

      {/* ✅ MESSAGE UI */}
      {message && (
        <div
          className={`text-sm text-center ${
            message.includes("❌") ? "text-red-400" : "text-green-400"
          }`}
        >
          {message}
        </div>
      )}

      <button
        onClick={save}
        className="bg-white text-black px-6 py-2 rounded"
      >
        Save Plan
      </button>
    </div>
  );
}