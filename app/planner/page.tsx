"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock3, Plus, Target, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/app/providers";
import { usePlanner } from "@/hooks/usePlanner";

type PlanType = "daily" | "weekly" | "monthly";

type Task = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  category: "deep_work" | "health" | "learning" | "admin" | "rest";
  done: boolean;
};

const categoryLabel = {
  deep_work: "Deep Work",
  health: "Health",
  learning: "Learning",
  admin: "Admin",
  rest: "Recovery",
};

export default function PlannerPage() {
  const { user } = useAuth();

  const [type, setType] = useState<PlanType>("daily");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const { plan, loadPlan, savePlan, loading } = usePlanner(user, type, date);

  const [mission, setMission] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadPlan();
  }, [user, type, date]);

  useEffect(() => {
    if (!plan) {
      setMission("");
      setTasks([]);
      return;
    }

    setMission(plan.focus || "");

    try {
      const parsed = typeof plan.tasks === "string"
        ? JSON.parse(plan.tasks)
        : plan.tasks;

      setTasks(parsed || []);
    } catch {
      setTasks([]);
    }
  }, [plan]);

  const addTask = () => {
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "",
        startTime: "",
        endTime: "",
        category: "deep_work",
        done: false,
      },
    ]);
  };

  const updateTask = (id: number, field: keyof Task, value: string | boolean) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, [field]: value } : task
      )
    );
  };

  const totalCompleted = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
  }, [tasks]);

  const handleSave = async () => {
    setSaving(true);
    await savePlan({
      focus: mission,
      tasks,
    });
    setSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-3xl shadow-sm p-6 border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Time Architecture</h1>
              <p className="text-gray-500 mt-1">
                Every hour has a purpose.
              </p>
            </div>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-500 block mb-2">
              Mission for today
            </label>
            <input
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              placeholder="What matters most today?"
              className="w-full border rounded-2xl px-4 py-3"
            />
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-12 gap-2 p-3 border rounded-2xl"
              >
                <button
                  onClick={() => updateTask(task.id, "done", !task.done)}
                  className="col-span-1"
                >
                  {task.done ? "✅" : "⬜"}
                </button>

                <input
                  type="time"
                  value={task.startTime}
                  onChange={(e) => updateTask(task.id, "startTime", e.target.value)}
                  className="col-span-2 border rounded-xl px-2 py-1"
                />

                <input
                  type="time"
                  value={task.endTime}
                  onChange={(e) => updateTask(task.id, "endTime", e.target.value)}
                  className="col-span-2 border rounded-xl px-2 py-1"
                />

                <input
                  value={task.title}
                  onChange={(e) => updateTask(task.id, "title", e.target.value)}
                  placeholder="What are you doing in this block?"
                  className="col-span-4 border rounded-xl px-3 py-1"
                />

                <select
                  value={task.category}
                  onChange={(e) => updateTask(task.id, "category", e.target.value)}
                  className="col-span-3 border rounded-xl px-2 py-1"
                >
                  {Object.entries(categoryLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={addTask}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-2xl"
            >
              <Plus className="w-4 h-4" />
              Add Time Block
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white px-6 py-2 rounded-2xl"
            >
              {saving ? "Saving..." : "Save Plan"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border rounded-3xl p-5">
            <Target className="w-5 h-5 mb-3" />
            <p className="text-sm text-gray-500">Execution Score</p>
            <p className="text-3xl font-bold mt-1">{totalCompleted}%</p>
          </div>

          <div className="bg-white border rounded-3xl p-5">
            <Clock3 className="w-5 h-5 mb-3" />
            <p className="text-sm text-gray-500">Blocks Planned</p>
            <p className="text-3xl font-bold mt-1">{tasks.length}</p>
          </div>

          <div className="bg-white border rounded-3xl p-5">
            <CheckCircle2 className="w-5 h-5 mb-3" />
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium mt-1">{loading ? "Syncing..." : "Ready"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
