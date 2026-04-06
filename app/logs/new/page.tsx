"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

export default function LogPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [tasks, setTasks] = useState<any[]>([]);
  const [taskId, setTaskId] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  // 🔐 Protect page
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // ✅ Fetch tasks
  useEffect(() => {
    if (!user?.id) return;

    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error(error.message);
        return;
      }

      setTasks(data || []);
    };

    fetchTasks();
  }, [user?.id]);

  // ✅ Create log
  const handleSave = async () => {
    if (!user) return alert("Not logged in");
    if (!taskId) return alert("Select a task");

    const totalMinutes =
      Number(hours || 0) * 60 + Number(minutes || 0);

    if (totalMinutes <= 0) {
      return alert("Enter valid time");
    }

    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("logs").insert({
      user_id: user.id,
      task_id: taskId,
      duration: totalMinutes,
      date: today,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // reset form
    setHours("");
    setMinutes("");
    setTaskId("");

    alert("Log saved!");
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Log Activity
      </h1>

      <div className="space-y-3">
        <select
          className="border p-2 w-full"
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
        >
          <option value="">Select Task</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.name} ({task.category})
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Hours"
            className="border p-2 w-1/2"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
          <input
            type="number"
            placeholder="Minutes"
            className="border p-2 w-1/2"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </div>

        <button
          onClick={handleSave}
          className="bg-black text-white p-2 w-full"
        >
          Save Log
        </button>
      </div>
    </div>
  );
}