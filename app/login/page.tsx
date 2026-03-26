"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");

  const login = async () => {
    if (!email) return alert("Enter email");

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (error || !data) {
      alert("User not found ❌");
      return;
    }

    const role = data.role.trim().toLowerCase();

    localStorage.setItem("user_id", data.id);
    localStorage.setItem("role", role);

    if (role === "super_admin" || role === "admin") {
      window.location.replace("/admin");
    } else {
      window.location.replace("/dashboard");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* ✈️ CINEMATIC BACKGROUND IMAGE */}
      <div className="absolute inset-0">
        <img
         src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80"
          className="w-full h-full object-cover scale-110 animate-slowZoom"
          alt="travel background"
        />
      </div>

      {/* 🌫 DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60" />

      {/* ✈️ FLOATING LIGHT EFFECTS */}
      <div className="absolute w-96 h-96 bg-blue-500/20 blur-3xl rounded-full top-10 left-10 animate-pulse" />
      <div className="absolute w-96 h-96 bg-purple-500/20 blur-3xl rounded-full bottom-10 right-10 animate-bounce" />

      {/* LOGIN CARD */}
      <div className="relative z-10 w-96 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl">

        <h1 className="text-3xl font-bold text-center text-white mb-2">
          ✈️ Travel CRM Login
        </h1>

        <p className="text-center text-gray-200 text-sm mb-6">
          Welcome to your travel dashboard
        </p>

        <input
          className="w-full border border-white/20 bg-white/10 text-white placeholder-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full mt-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg font-semibold hover:scale-105 transition"
        >
          Login ✈️
        </button>

        <p className="text-center text-xs text-gray-300 mt-4">
          Secure access to travel system
        </p>

      </div>

      {/* 🎬 ANIMATION STYLE */}
      <style jsx>{`
        .animate-slowZoom {
          animation: slowZoom 20s ease-in-out infinite alternate;
        }

        @keyframes slowZoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.1);
          }
        }
      `}</style>

    </div>
  );
}