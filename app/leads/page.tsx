"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function EmployeeLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [notesMap, setNotesMap] = useState<any>({});
  const [editingLead, setEditingLead] = useState<any>(null);

  // ================= AUTH FIX (IMPORTANT) =================
  useEffect(() => {
    const id = localStorage.getItem("user_id");
    const storedRole = localStorage.getItem("role");

    // ❌ agar missing hai to login
    if (!id || !storedRole) {
      window.location.replace("/login");
      return;
    }

    setUserId(id);
    setRole(storedRole);
  }, []);

  // ================= LOAD DATA =================
  useEffect(() => {
    if (userId && role) {
      fetchLeads(userId, role);
      fetchUsers();
    }
  }, [userId, role]);

  // ================= USERS =================
  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("id, name, role");
    setUsers(data || []);
  };

  // ================= LEADS =================
  const fetchLeads = async (uid: string, userRole: string) => {
    setLoading(true);

    let query = supabase.from("leads").select("*");

    if (userRole === "employee") {
      query = query.eq("assigned_to", uid);
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

  // ================= STATUS =================
  const updateStatus = async (id: string, status: string) => {
    await supabase.from("leads").update({ status }).eq("id", id);

    if (userId && role) fetchLeads(userId, role);
  };

  // ================= NOTES =================
  const saveNote = async (id: string) => {
    const note = notesMap[id];
    if (!note) return;

    await supabase.from("leads").update({ notes: note }).eq("id", id);

    if (userId && role) fetchLeads(userId, role);
  };

  // ================= EDIT =================
  const updateLead = async () => {
    if (!editingLead) return;

    await supabase
      .from("leads")
      .update({
        name: editingLead.name,
        phone: editingLead.phone,
        email: editingLead.email,
        destination: editingLead.destination,
      })
      .eq("id", editingLead.id);

    setEditingLead(null);

    if (userId && role) fetchLeads(userId, role);
  };

  // ================= ASSIGN =================
  const assignLead = async (leadId: string, assignUserId: string) => {
    if (!assignUserId) return;

    await supabase
      .from("leads")
      .update({
        assigned_to: assignUserId,
        status: "assigned",
      })
      .eq("id", leadId);

    if (userId && role) fetchLeads(userId, role);
  };

  const canAssign = role === "super_admin" || role === "admin";

  // ================= UI =================
  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {role === "employee" ? "👨‍💼 My Leads" : "🧑‍💻 Leads Dashboard"}
        </h1>
      </div>

      {/* LOADING */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-[1200px] w-full text-sm">

            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">Client</th>
                <th>Travel</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Assigned</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t">

                  {/* CLIENT */}
                  <td className="p-3">
                    <div className="font-semibold">{lead.name}</div>
                    <div className="text-xs">📞 {lead.phone}</div>
                    <div className="text-xs">📧 {lead.email}</div>
                  </td>

                  {/* TRAVEL */}
                  <td>
                    <div>{lead.destination}</div>
                    <div className="text-xs">
                      {lead.start_date} → {lead.end_date}
                    </div>
                  </td>

                  {/* STATUS */}
                  <td>
                    <select
                      value={lead.status || "pending"}
                      onChange={(e) =>
                        updateStatus(lead.id, e.target.value)
                      }
                      className="border p-1 rounded"
                    >
                      <option value="pending">Pending</option>
                      <option value="followup">Followup</option>
                      <option value="success">Success</option>
                      <option value="assigned">Assigned</option>
                    </select>
                  </td>

                  {/* NOTES */}
                  <td>
                    <input
                      defaultValue={lead.notes || ""}
                      onChange={(e) =>
                        setNotesMap((prev: any) => ({
                          ...prev,
                          [lead.id]: e.target.value,
                        }))
                      }
                      className="border p-1 rounded"
                    />

                    <button
                      onClick={() => saveNote(lead.id)}
                      className="text-xs ml-1 bg-black text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                  </td>

                  {/* ASSIGNED */}
                  <td>
                    {canAssign ? (
                      <select
                        value={lead.assigned_to || ""}
                        onChange={(e) =>
                          assignLead(lead.id, e.target.value)
                        }
                        className="border p-1 rounded"
                      >
                        <option value="">Unassigned</option>

                        {users
                          .filter((u) => u.role === "employee")
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <span className="text-xs">
                        {lead.assigned_to || "Unassigned"}
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="space-x-2">

                    <a
                      href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
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
                      onClick={() => setEditingLead(lead)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Edit
                    </button>

                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">

            <h2>Edit Lead</h2>

            <input
              value={editingLead.name || ""}
              onChange={(e) =>
                setEditingLead({ ...editingLead, name: e.target.value })
              }
              className="border p-2 w-full mb-2"
            />

            <input
              value={editingLead.phone || ""}
              onChange={(e) =>
                setEditingLead({ ...editingLead, phone: e.target.value })
              }
              className="border p-2 w-full mb-2"
            />

            <input
              value={editingLead.email || ""}
              onChange={(e) =>
                setEditingLead({ ...editingLead, email: e.target.value })
              }
              className="border p-2 w-full mb-2"
            />

            <button
              onClick={updateLead}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Save
            </button>

            <button
              onClick={() => setEditingLead(null)}
              className="ml-2 border px-4 py-2"
            >
              Cancel
            </button>

          </div>
        </div>
      )}

    </div>
  );
}