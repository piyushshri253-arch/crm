"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PendingPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // ================= AUTH =================
  useEffect(() => {
    const id = localStorage.getItem("user_id");
    const storedRole = localStorage.getItem("role");

    if (!id || !storedRole) {
      alert("Login required ❌");
      window.location.href = "/login";
      return;
    }

    setUserId(id);
    setRole(storedRole);
  }, []);

  // ================= LOAD =================
  useEffect(() => {
    if (userId && role) {
      fetchPending();
      fetchUsers();
    }
  }, [userId, role]);

  // ================= FETCH PENDING LEADS =================
  const fetchPending = async () => {
    setLoading(true);

    let query = supabase
      .from("leads")
      .select("*")
      .eq("status", "pending");

    // employee sees only assigned pending leads
    if (role === "employee") {
      query = query.eq("assigned_to", userId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error(error.message);
      setLoading(false);
      return;
    }

    setLeads(data || []);
    setLoading(false);
  };

  // ================= USERS =================
  const fetchUsers = async () => {
    const { data } = await supabase
      .from("users")
      .select("id, name, role");

    setUsers(data || []);
  };

  // ================= ASSIGN LEAD =================
  const assignLead = async (leadId: string, assignUserId: string) => {
    if (!assignUserId) return;

    const { error } = await supabase
      .from("leads")
      .update({
        assigned_to: assignUserId,
        status: "assigned",
      })
      .eq("id", leadId);

    if (error) {
      console.error("Assign error:", error.message);
      alert(error.message);
      return;
    }

    fetchPending();
  };

  // ================= UI =================
  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">
          🟡 Pending Leads
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

      {/* LOADING */}
      {loading ? (
        <div>Loading pending leads...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">

          <table className="min-w-[1100px] w-full text-sm">

            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">Client</th>
                <th>Contact</th>
                <th>Destination</th>
                <th>Assigned</th>
                <th>Assign</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500">
                    No pending leads 🎉
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-t">

                    {/* CLIENT */}
                    <td className="p-3 font-semibold">
                      {lead.name}
                    </td>

                    {/* CONTACT */}
                    <td>
                      <div>📞 {lead.phone}</div>
                      <div className="text-xs">📧 {lead.email}</div>
                    </td>

                    {/* DESTINATION */}
                    <td>{lead.destination}</td>

                    {/* ASSIGNED STATUS */}
                    <td>
                      <span className="text-xs bg-yellow-100 px-2 py-1 rounded">
                        {lead.assigned_to ? "Assigned" : "Unassigned"}
                      </span>
                    </td>

                    {/* ASSIGN */}
                    <td>
                      {role === "super_admin" || role === "admin" ? (
                        <select
                          onChange={(e) =>
                            assignLead(lead.id, e.target.value)
                          }
                          className="border p-1 rounded"
                        >
                          <option value="">Assign Employee</option>

                          {users
                            .filter((u) => u.role === "employee")
                            .map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <span className="text-xs text-gray-500">
                          No Access
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="space-x-2">

                      <a
                        href={`https://wa.me/91${lead.phone}`}
                        target="_blank"
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                      >
                        WA
                      </a>

                      <a
                        href={`mailto:${lead.email}`}
                        className="bg-purple-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Mail
                      </a>

                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      )}

    </div>
  );
}