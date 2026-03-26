"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CandidatesPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // ================= AUTH =================
  useEffect(() => {
    const id = localStorage.getItem("user_id");
    const storedRole = localStorage.getItem("role");

    if (!id || !storedRole) {
      alert("Login required ❌");
      window.location.href = "/login";
      return;
    }

    // only super admin allowed
    if (storedRole !== "super_admin") {
      alert("Access Denied ❌ Super Admin Only");
      window.location.href = "/dashboard";
      return;
    }

    setUserId(id);
    setRole(storedRole);
  }, []);

  // ================= LOAD DATA =================
  useEffect(() => {
    if (role) {
      fetchCandidates();
      fetchUsers();
    }
  }, [role]);

  // ================= FETCH LEADS (ONLY PENDING) =================
  const fetchCandidates = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error.message);
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
      alert("Assignment failed ❌");
      return;
    }

    fetchCandidates();
  };

  // ================= DELETE LEAD =================
  const deleteLead = async (id: string) => {
    const confirmDelete = confirm("Delete this lead?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchCandidates();
  };

  // ================= UI =================
  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">
          🧑‍💻 Candidates (New Leads)
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
        <div>Loading candidates...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">

          <table className="min-w-[1100px] w-full text-sm">

            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Client</th>
                <th>Contact</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Assign To</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500">
                    No new candidates
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-t hover:bg-gray-50">

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

                    {/* STATUS */}
                    <td>
                      <span className="bg-yellow-200 px-2 py-1 rounded text-xs">
                        {lead.status}
                      </span>
                    </td>

                    {/* ASSIGN */}
                    <td>
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

                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Delete
                      </button>

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