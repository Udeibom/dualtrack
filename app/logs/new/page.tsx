"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

export default function LogPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [tasks, setTasks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const [partnerLogs, setPartnerLogs] = useState<any[]>([]);
  const [partnerName, setPartnerName] = useState("Partner");

  const [taskId, setTaskId] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const [fetchingLogs, setFetchingLogs] = useState(true);

  // ✏️ Editing state
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editTaskId, setEditTaskId] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editMinutes, setEditMinutes] = useState("");

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

  // ✅ Fetch logs (YOU + PARTNER)
  const fetchLogs = async () => {
    if (!user?.id) return;

    setFetchingLogs(true);

    // 👉 get partner id
    const { data: profile } = await supabase
      .from("profiles")
      .select("partner_id")
      .eq("id", user.id)
      .single();

    // 👉 YOUR LOGS
    const { data: myLogs, error: myError } = await supabase
      .from("logs")
      .select(
        `
        *,
        tasks (
          name,
          category
        )
      `
      )
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (myError) {
      console.error(myError.message);
    }

    setLogs(myLogs || []);

    // 👉 PARTNER LOGS
    if (profile?.partner_id) {
      const { data: partnerProfile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", profile.partner_id)
        .single();

      if (partnerProfile?.name) {
        setPartnerName(partnerProfile.name);
      }

      const { data: pLogs, error: pError } = await supabase
        .from("logs")
        .select(
          `
          *,
          tasks (
            name,
            category
          )
        `
        )
        .eq("user_id", profile.partner_id)
        .order("date", { ascending: false });

      if (pError) {
        console.error(pError.message);
      }

      setPartnerLogs(pLogs || []);
    } else {
      setPartnerLogs([]);
    }

    setFetchingLogs(false);
  };

  useEffect(() => {
    fetchLogs();
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

    setHours("");
    setMinutes("");
    setTaskId("");

    await fetchLogs();
  };

  // ❌ Delete log
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this log?")) return;

    const { error } = await supabase
      .from("logs")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await fetchLogs();
  };

  // ✏️ Start editing
  const startEdit = (log: any) => {
    setEditingLogId(log.id);
    setEditTaskId(log.task_id);

    const h = Math.floor(log.duration / 60);
    const m = log.duration % 60;

    setEditHours(String(h));
    setEditMinutes(String(m));
  };

  // ✏️ Cancel editing
  const cancelEdit = () => {
    setEditingLogId(null);
    setEditTaskId("");
    setEditHours("");
    setEditMinutes("");
  };

  // ✏️ Save edit
  const handleUpdate = async () => {
    if (!editingLogId) return;

    const totalMinutes =
      Number(editHours || 0) * 60 + Number(editMinutes || 0);

    if (totalMinutes <= 0) {
      return alert("Enter valid time");
    }

    const { error } = await supabase
      .from("logs")
      .update({
        task_id: editTaskId,
        duration: totalMinutes,
      })
      .eq("id", editingLogId);

    if (error) {
      alert(error.message);
      return;
    }

    cancelEdit();
    await fetchLogs();
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;

    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const categoryStyle = (cat: string) => {
    if (cat === "growth") return "bg-green-100 text-green-700";
    if (cat === "neutral") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Log Activity
      </h1>

      {/* CREATE LOG */}
      <div className="space-y-3 mb-8">
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

      {/* YOUR LOGS */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">
          Your Logs
        </h2>

        {fetchingLogs ? (
          <p>Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-500">No logs yet</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const isEditing = editingLogId === log.id;

              return (
                <div
                  key={log.id}
                  className="bg-white border rounded-xl p-3 shadow-sm space-y-3"
                >
                  {isEditing ? (
                    <>
                      <select
                        className="border p-2 w-full"
                        value={editTaskId}
                        onChange={(e) =>
                          setEditTaskId(e.target.value)
                        }
                      >
                        {tasks.map((task) => (
                          <option key={task.id} value={task.id}>
                            {task.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          className="border p-2 w-1/2"
                          value={editHours}
                          onChange={(e) =>
                            setEditHours(e.target.value)
                          }
                        />
                        <input
                          type="number"
                          className="border p-2 w-1/2"
                          value={editMinutes}
                          onChange={(e) =>
                            setEditMinutes(e.target.value)
                          }
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdate}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-300 px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {log.tasks?.name || "Unknown Task"}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${categoryStyle(
                              log.tasks?.category || "neutral"
                            )}`}
                          >
                            {log.tasks?.category}
                          </span>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">
                            {formatDuration(log.duration)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {log.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(log)}
                          className="text-sm bg-blue-500 text-white px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-sm bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PARTNER LOGS */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          {partnerName}'s Logs
        </h2>

        {fetchingLogs ? (
          <p>Loading...</p>
        ) : partnerLogs.length === 0 ? (
          <p className="text-gray-500">No logs yet</p>
        ) : (
          <div className="space-y-3">
            {partnerLogs.map((log) => (
              <div
                key={log.id}
                className="bg-gray-50 border rounded-xl p-3"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {log.tasks?.name || "Unknown Task"}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${categoryStyle(
                        log.tasks?.category || "neutral"
                      )}`}
                    >
                      {log.tasks?.category}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {formatDuration(log.duration)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {log.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}