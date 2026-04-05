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
  const [partnerTasks, setPartnerTasks] = useState<any[]>([]);
  const [partnerName, setPartnerName] = useState("Partner");
  const [fetching, setFetching] = useState(true);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("growth");

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchTasks = async () => {
      setFetching(true);

      const { data: myTasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setTasks(myTasks || []);

      const { data: profile } = await supabase
        .from("profiles")
        .select("partner_id")
        .eq("id", user.id)
        .single();

      if (profile?.partner_id) {
        const { data: partnerProfile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", profile.partner_id)
          .single();

        if (partnerProfile?.name) setPartnerName(partnerProfile.name);

        const { data: pTasks } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", profile.partner_id)
          .order("created_at", { ascending: false });

        setPartnerTasks(pTasks || []);
      } else {
        setPartnerTasks([]);
      }

      setFetching(false);
    };

    fetchTasks();
  }, [user?.id]);

  useEffect(() => {
    if (name.trim()) setCategory(suggestCategory(name));
  }, [name]);

  const handleCreate = async () => {
    if (!user) return alert("Not logged in");
    if (!name.trim()) return alert("Task name is required");

    const { data: existing } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("name", name);

    if (existing?.length) return alert("Task already exists");

    const { data, error } = await supabase
      .from("tasks")
      .insert({ user_id: user.id, name, category })
      .select()
      .single();

    if (error) return alert("Error creating task");

    setTasks((prev) => [data, ...prev]);
    setName("");
    setCategory("growth");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return;

    await supabase.from("tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const startEdit = (task: any) => {
    setEditingTaskId(task.id);
    setEditName(task.name);
    setEditCategory(task.category);
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditName("");
    setEditCategory("growth");
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;

    const { data } = await supabase
      .from("tasks")
      .update({ name: editName, category: editCategory })
      .eq("id", id)
      .select()
      .single();

    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    cancelEdit();
  };

  const categoryStyle = (cat: string) => {
    if (cat === "growth") return "bg-green-100 text-green-700";
    if (cat === "neutral") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  if (loading) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-28 pt-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Your Tasks
      </h1>

      {/* TASK LIST */}
      <div className="space-y-6">
        {/* YOUR TASKS */}
        <section>
          <h2 className="text-lg font-semibold mb-3">You</h2>

          {fetching ? (
            <p>Loading...</p>
          ) : tasks.length === 0 ? (
            <p className="text-black">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white shadow-sm rounded-xl p-3 border"
                >
                  {editingTaskId === task.id ? (
                    <div className="space-y-2">
                      <input
                        className="w-full border rounded-lg p-2"
                        value={editName}
                        onChange={(e) =>
                          setEditName(e.target.value)
                        }
                      />

                      <select
                        className="w-full border rounded-lg p-2"
                        value={editCategory}
                        onChange={(e) =>
                          setEditCategory(e.target.value)
                        }
                      >
                        <option value="growth">Growth</option>
                        <option value="neutral">Neutral</option>
                        <option value="waste">Waste</option>
                      </select>

                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(task.id)}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 bg-gray-300 py-2 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{task.name}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${categoryStyle(
                            task.category
                          )}`}
                        >
                          {task.category}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(task)}
                          className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PARTNER TASKS */}
        <section>
          <h2 className="text-lg font-semibold mb-3">
            {partnerName}
          </h2>

          {fetching ? (
            <p>Loading...</p>
          ) : partnerTasks.length === 0 ? (
            <p className="text-black">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {partnerTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-50 border rounded-xl p-3"
                >
                  <p className="font-medium text-gray-900">{task.name}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${categoryStyle(
                      task.category
                    )}`}
                  >
                    {task.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* STICKY CREATE BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-md mx-auto space-y-2">
          <input
            placeholder="Add new task..."
            className="w-full border rounded-lg p-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex gap-2">
            <select
              className="flex-1 border rounded-lg p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="growth">Growth</option>
              <option value="neutral">Neutral</option>
              <option value="waste">Waste</option>
            </select>

            <button
              onClick={handleCreate}
              className="flex-1 bg-black text-white rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}