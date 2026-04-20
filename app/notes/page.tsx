"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/providers";

type Note = {
  id: string;
  content: string | null;
  link: string | null;
  description: string | null;
  created_at: string;
};

export default function NotesPage() {
  const { user } = useAuth();

  const [notes, setNotes] = useState<Note[]>([]);
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Load notes
  const fetchNotes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotes(data);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  // Add note
  const handleAddNote = async () => {
    if (!link.trim() || !user) return;

    setLoading(true);

    const { error } = await supabase.from("notes").insert({
      content: link, // fallback for old schema
      link,
      description,
      user_id: user.id,
    });

    if (!error) {
      setLink("");
      setDescription("");
      fetchNotes();
    } else {
      console.log(error);
    }

    setLoading(false);
  };

  // Delete note
  const handleDelete = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    fetchNotes();
  };

  if (!user) {
    return <div className="p-6">Please login</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">My Notes</h1>

      {/* Input */}
      <div className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          placeholder="Paste link..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
        />

        <input
          type="text"
          placeholder="What is this link for? (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
        />

        <button
          onClick={handleAddNote}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-white text-black font-medium w-fit"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 && (
          <p className="text-gray-400 text-sm">No notes yet.</p>
        )}

        {notes.map((note) => {
          const displayLink = note.link || note.content;

          return (
            <div
              key={note.id}
              className="p-4 rounded-xl bg-black/30 border border-white/10 flex justify-between items-start"
            >
              <div className="text-sm text-gray-200 break-words">
                {displayLink && (
                  <a
                    href={displayLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    {displayLink}
                  </a>
                )}

                {note.description && (
                  <p className="text-gray-400 mt-1">
                    {note.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleDelete(note.id)}
                className="text-xs text-red-400 hover:text-red-300 ml-4"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}