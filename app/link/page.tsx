"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

export default function LinkPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [code, setCode] = useState("");
  const [myCode, setMyCode] = useState("");

  // 🔐 Protect page
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // 🔑 Fetch current user's partner code
  useEffect(() => {
    if (!user) return;

    const fetchCode = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("partner_code")
        .eq("id", user.id)
        .single();

      if (data) setMyCode(data.partner_code);
    };

    fetchCode();
  }, [user]);

  const handleLink = async () => {
    if (!user) {
      alert("Not logged in");
      return;
    }

    const cleanedCode = code.trim().toUpperCase();

    if (!cleanedCode) {
      alert("Enter a code");
      return;
    }

    // 🔍 Find partner
    const { data: partner, error } = await supabase
      .from("profiles")
      .select("id, partner_id")
      .eq("partner_code", cleanedCode)
      .single();

    if (error || !partner) {
      alert("Invalid code");
      return;
    }

    if (partner.id === user.id) {
      alert("You cannot link with yourself");
      return;
    }

    // ✅ FIX 3: smarter guard (allows re-linking same pair)
    if (partner.partner_id && partner.partner_id !== user.id) {
      alert("This user is already linked");
      return;
    }

    // ✅ Call RPC
    const { error: rpcError } = await supabase.rpc("link_partners", {
      user1: user.id,
      user2: partner.id,
    });

    if (rpcError) {
      alert(rpcError.message);
      return;
    }

    alert("Linked successfully!");

    // ✅ FIX 4: clean redirect instead of reload
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold">Enter Partner Code</h1>

      {/* Show user's own code */}
      {myCode && (
        <div className="border p-3 rounded bg-gray-50">
          <p className="text-sm text-gray-500">Your Code</p>
          <p className="font-bold text-black">{myCode}</p>
        </div>
      )}

      <input
        placeholder="Enter code"
        className="border p-2"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button
        onClick={handleLink}
        className="bg-black text-white p-2"
      >
        Connect
      </button>
    </div>
  );
}