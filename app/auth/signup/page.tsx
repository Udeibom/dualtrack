"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { generatePartnerCode } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    // 1️⃣ Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      console.error("Signup error:", error.message);
      alert(error.message);
      return;
    }

    const user = data.user;

    if (user) {
      const code = generatePartnerCode();

      // 2️⃣ Try inserting into profiles and log the exact error
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        name: name,
        partner_code: code,
      });

      if (profileError) {
        console.error("Profile insert error:", profileError);
        alert("Signup succeeded, but failed to create profile. Check console.");
        return;
      }
    }

    alert("Signup successful! Check your email.");
    router.push("/auth/login");
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold">Sign Up</h1>

      <input
        placeholder="Name"
        className="border p-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Email"
        className="border p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSignup}
        className="bg-black text-white p-2"
      >
        Sign Up
      </button>
    </div>
  );
}