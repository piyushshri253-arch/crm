"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CreateUser() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "employee",
  });

  const [loading, setLoading] = useState(false);

  const createUser = async () => {
    if (!user.name || !user.email) {
      alert("Please fill all fields ❌");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("users").insert([user]);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Employee Created ✅");

    setUser({
      name: "",
      email: "",
      role: "employee",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create Employee 👨‍💻</h1>
          <p className="text-sm text-gray-500">
            Super Admin can add team members
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4">

          {/* NAME */}
          <input
            placeholder="Full Name"
            value={user.name}
            onChange={(e) =>
              setUser({ ...user, name: e.target.value })
            }
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* EMAIL */}
          <input
            placeholder="Email Address"
            value={user.email}
            onChange={(e) =>
              setUser({ ...user, email: e.target.value })
            }
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* ROLE INFO */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Role: <span className="font-semibold">Employee</span>
          </div>

          {/* BUTTON */}
          <button
            onClick={createUser}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            {loading ? "Creating..." : "Create Employee"}
          </button>

        </div>
      </div>
    </div>
  );
}