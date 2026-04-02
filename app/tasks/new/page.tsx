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
  const [tasks, setTasks] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // ✏️ Editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("growth");

  // 🔐 Protect page
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // 📥 Fetch tasks
  useEffect(() => {
    if (!user?.id) return;

    const fetchTasks = async () => {
      setFetching(true);

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        setTasks(data || []);
      }

      setFetching(false);
    };

    fetchTasks();
  }, [user?.id]);

  // 🤖 Auto-suggest category
  useEffect(() => {
    if (name.trim().length > 0) {
      const suggested = suggestCategory(name);
      setCategory(suggested);
    }
  }, [name]);

  // ➕ CREATE TASK
  const handleCreate = async () => {
    if (!user) return alert("Not logged in");
    if (!name.trim()) return alert("Task name is required");

    const { data: existingTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("name", name);

    if (existingTasks && existingTasks.length > 0) {
      return alert("Task already exists");
    }

    const { data: newTask, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        name,
        category,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return alert("Error creating task");
    }

    setTasks((prev) => [newTask, ...prev]);
    setName("");
    setCategory("growth");

    alert("Task created!");
  };

  // 🗑 DELETE TASK
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this task?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error(error);
      return alert("Error deleting task");
    }

    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // ✏️ START EDIT
  const startEdit = (task: any) => {
    setEditingTaskId(task.id);
    setEditName(task.name);
    setEditCategory(task.category);
  };

  // ❌ CANCEL EDIT
  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditName("");
    setEditCategory("growth");
  };

  // 💾 SAVE EDIT
  const saveEdit = async (id: string) => {
    if (!editName.trim()) return alert("Task name required");

    const { data, error } = await supabase
      .from("tasks")
      .update({
        name: editName,
        category: editCategory,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(error);
      return alert("Error updating task");
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? data : t))
    );

    cancelEdit();
  };

  if (loading) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold">Add Task</h1>

      {/* CREATE FORM */}
      <div className="flex flex-col gap-4">
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

      {/* TASK LIST */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Your Tasks</h2>

        {fetching ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500">No tasks yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="border p-2 flex flex-col gap-2"
              >
                {editingTaskId === task.id ? (
                  <>
                    <input
                      className="border p-1"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />

                    <select
                      className="border p-1"
                      value={editCategory}
                      onChange={(e) =>
                        setEditCategory(e.target.value)
                      }
                    >
                      <option value="growth">Growth</option>
                      <option value="neutral">Neutral</option>
                      <option value="waste">Time-wasting</option>
                    </select>

                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(task.id)}
                        className="bg-green-600 text-white px-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-400 text-white px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p>{task.name}</p>
                      <p className="text-sm text-gray-500">
                        {task.category}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(task)}
                        className="text-blue-600 text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}