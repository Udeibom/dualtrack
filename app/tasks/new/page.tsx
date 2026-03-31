"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { suggestCategory } from "@/lib/ai";

export default function NewTaskPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("growth");

  // 🔐 Protect page
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // 🤖 Auto-suggest category
  useEffect(() => {
    if (name.trim().length > 0) {
      const suggested = suggestCategory(name);
      setCategory(suggested);
    }
  }, [name]);

  const handleCreate = async () => {
    if (!user) {
      alert("Not logged in");
      return;
    }

    if (!name.trim()) {
      alert("Task name is required");
      return;
    }

    // 🔍 Check for duplicate task
    const { data: existingTasks, error: existingError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("name", name);

    if (existingError) {
      console.error("Error checking existing task:", existingError);
      alert("An error occurred while checking existing tasks.");
      return;
    }

    if (existingTasks && existingTasks.length > 0) {
      alert("Task already exists");
      return;
    }

    // ➕ Insert new task
    const { error: insertError } = await supabase.from("tasks").insert({
      user_id: user.id,
      name,
      category,
    });

    if (insertError) {
      console.error("Error inserting task:", insertError);
      alert("An error occurred while creating the task.");
      return;
    }

    alert("Task created!");

    router.push("/");
    router.refresh();
  };

  if (loading) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold">Add Task</h1>

      <input
        placeholder="Task name (e.g. Coding)"
        className="border p-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select
        className="border p-2"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="growth">Growth</option>
        <option value="neutral">Neutral</option>
        <option value="waste">Time-wasting</option>
      </select>

      <button
        onClick={handleCreate}
        className="bg-black text-white p-2"
      >
        Save Task
      </button>
    </div>
  );
}