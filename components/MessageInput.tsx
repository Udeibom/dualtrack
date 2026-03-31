"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MessageInput({
  partnerId,
  onMessageSent,
}: {
  partnerId: string;
  onMessageSent?: (msg: any) => void;
}) {
  const [text, setText] = useState("");

  const sendMessage = async () => {
    if (!text.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const newMessage = {
      sender_id: user.id,
      receiver_id: partnerId,
      text,
    };

    const { error } = await supabase.from("messages").insert(newMessage);

    if (error) {
      alert(error.message);
      return;
    }

    // instant UI update
    onMessageSent?.({
      ...newMessage,
      created_at: new Date().toISOString(),
    });

    setText("");
  };

  return (
    <div className="flex gap-2 mt-4">
      <input
        className="w-full px-4 py-2 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400"
        placeholder="Send a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={sendMessage}
        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-white"
      >
        Send
      </button>
    </div>
  );
}