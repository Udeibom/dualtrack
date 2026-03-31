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

  // ✅ FIXED: Fetch tasks safely with debug logs
  useEffect(() => {
    if (!user?.id) return;

    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id);

      console.log("AUTH USER ID:", user.id);
      console.log("FETCHED TASKS:", data);
      console.log("ERROR:", error);

      if (error) {
        console.error("FETCH TASKS ERROR:", error.message);
        return;
      }

      setTasks(data || []);
    };

    fetchTasks();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user) {
      alert("Not logged in");
      return;
    }

    if (!taskId) {
      alert("Select a task");
      return;
    }

    const totalMinutes =
      Number(hours || 0) * 60 + Number(minutes || 0);

    if (totalMinutes <= 0) {
      alert("Enter valid time");
      return;
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

    alert("Logged successfully!");

    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold">Log Activity</h1>

      <select
        className="border p-2"
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
        className="bg-black text-white p-2"
      >
        Save Log
      </button>
    </div>
  );
}