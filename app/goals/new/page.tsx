"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NewGoalPage() {
  const [text, setText] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    if (!text.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      alert("Not logged in");
      return;
    }

    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      text,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Goal added!");
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold">Add Goal</h1>

      <input
        placeholder="e.g. Study skincare 2h daily"
        className="border p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleCreate}
        className="bg-black text-white p-2"
      >
        Save Goal
      </button>
    </div>
  );
}