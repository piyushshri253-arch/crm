"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import StatsCard from "../../components/StatsCard";
import LeadsTable from "../../components/LeadsTable";

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    const userId = localStorage.getItem("user_id");

    setRole(userRole);

    fetchLeads(userRole, userId);
  }, []);

  const fetchLeads = async (
    userRole: string | null,
    userId: string | null
  ) => {
    let query = supabase.from("leads").select("*");

    // 🔒 ONLY EMPLOYEE FILTER
    if (userRole === "employee") {
      query = query.eq("assigned_to", userId);
    }

    const { data } = await query;
    setLeads(data || []);
  };

  // 📊 STATS
  const total = leads.length;
  const pending = leads.filter((l) => l.status === "pending").length;
  const success = leads.filter((l) => l.status === "success").length;

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Dashboard 🚀 {role === "admin" ? "(Admin)" : "(Employee)"}
        </h1>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Leads" value={total} color="bg-blue-500" />
        <StatsCard title="Pending" value={pending} color="bg-yellow-500" />
        <StatsCard title="Success" value={success} color="bg-green-500" />
      </div>

      {/* TABLE */}
      <div className="bg-white p-4 rounded-xl shadow">
        <LeadsTable leads={leads} />
      </div>
    </div>
  );
}