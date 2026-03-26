"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ReportsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const userRole = localStorage.getItem("role") || "";
    const normalizedRole = userRole.trim().toLowerCase();

    setRole(normalizedRole);
    fetchLeads(normalizedRole);
  }, []);

  const fetchLeads = async (userRole: string) => {
    const userId = localStorage.getItem("user_id");

    let query = supabase.from("leads").select("*");

    // 👇 ONLY employees restricted
    const isAdmin = userRole === "admin";

    if (!isAdmin) {
      query = query.eq("assigned_to", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch error:", error);
      return;
    }

    setLeads(data || []);
  };

  // 📊 STATS
  const total = leads.length;
  const pending = leads.filter((l) => l.status === "pending").length;
  const assigned = leads.filter((l) => l.status === "assigned").length;
  const success = leads.filter((l) => l.status === "success").length;
  const followup = leads.filter((l) => l.status === "followup").length;

  const conversion =
    total > 0 ? ((success / total) * 100).toFixed(1) : "0";

  const isAdmin = role === "admin";

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Reports 📊 {isAdmin ? "(Super Admin)" : "(Employee)"}
        </h1>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card title="Total" value={total} />
        <Card title="Pending" value={pending} />
        <Card title="Assigned" value={assigned} />
        <Card title="Followup" value={followup} />
        <Card title="Success" value={success} />
      </div>

      {/* CONVERSION */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold">
          Conversion Rate 🚀: {conversion}%
        </h2>
      </div>

      {/* TABLE */}
      <div className="bg-white p-4 rounded-xl shadow overflow-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Assigned To</th>
            </tr>
          </thead>

          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No leads found
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="text-center">
                  <td className="p-2 border">{lead.name}</td>
                  <td className="p-2 border">{lead.email}</td>
                  <td className="p-2 border">{lead.status}</td>
                  <td className="p-2 border">{lead.assigned_to}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* 👇 Card Component */
function Card({ title, value }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow text-center">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}