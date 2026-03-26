"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function FollowupsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [notesMap, setNotesMap] = useState<any>({});
  const [editingLead, setEditingLead] = useState<any>(null);

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

  // ================= FETCH =================
  useEffect(() => {
    if (userId && role) fetchLeads(userId, role);
  }, [userId, role]);

  const fetchLeads = async (uid: string, userRole: string) => {
    setLoading(true);

    let query = supabase
      .from("leads")
      .select("*")
      .eq("status", "followup"); // 🔥 ONLY FOLLOWUPS

    if (userRole === "employee") {
      query = query.eq("assigned_to", uid);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Fetch error:", error.message);
      setLoading(false);
      return;
    }

    setLeads(data || []);
    setLoading(false);
  };

  // ================= STATUS UPDATE =================
  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error(error.message);
      return;
    }

    if (userId && role) fetchLeads(userId, role);
  };

  // ================= SAVE NOTE =================
  const saveNote = async (id: string) => {
    const note = notesMap[id];
    if (!note) return;

    const { error } = await supabase
      .from("leads")
      .update({ notes: note })
      .eq("id", id);

    if (error) {
      console.error(error.message);
      return;
    }

    if (userId && role) fetchLeads(userId, role);
  };

  // ================= EDIT LEAD =================
  const updateLead = async () => {
    if (!editingLead) return;

    const { error } = await supabase
      .from("leads")
      .update({
        name: editingLead.name,
        phone: editingLead.phone,
        email: editingLead.email,
        destination: editingLead.destination,
      })
      .eq("id", editingLead.id);

    if (error) {
      console.error(error.message);
      return;
    }

    setEditingLead(null);
    if (userId && role) fetchLeads(userId, role);
  };

  // ================= UI =================
  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">
          🔔 Follow-ups Leads
        </h1>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="text-center p-10">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-[1200px] w-full text-sm">

            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">Client</th>
                <th>Travel</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-gray-500">
                    No followups found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
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
                        value={lead.status}
                        onChange={(e) =>
                          updateStatus(lead.id, e.target.value)
                        }
                        className="border p-1 rounded"
                      >
                        <option value="pending">Pending</option>
                        <option value="followup">Followup</option>
                        <option value="success">Success</option>
                      </select>
                    </td>

                    {/* NOTES */}
                    <td>
                      <input
                        defaultValue={lead.notes || ""}
                        className="border p-1 rounded"
                        onChange={(e) =>
                          setNotesMap((prev: any) => ({
                            ...prev,
                            [lead.id]: e.target.value,
                          }))
                        }
                      />

                      <button
                        onClick={() => saveNote(lead.id)}
                        className="ml-1 bg-black text-white px-2 py-1 rounded text-xs"
                      >
                        Save
                      </button>
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
                        onClick={() => setEditingLead(lead)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Edit
                      </button>

                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">

            <h2 className="text-xl font-bold mb-3">Edit Lead</h2>

            <input
              value={editingLead.name || ""}
              onChange={(e) =>
                setEditingLead({ ...editingLead, name: e.target.value })
              }
              className="w-full border p-2 mb-2"
            />

            <input
              value={editingLead.phone || ""}
              onChange={(e) =>
                setEditingLead({ ...editingLead, phone: e.target.value })
              }
              className="w-full border p-2 mb-2"
            />

            <input
              value={editingLead.email || ""}
              onChange={(e) =>
                setEditingLead({ ...editingLead, email: e.target.value })
              }
              className="w-full border p-2 mb-2"
            />

            <input
              value={editingLead.destination || ""}
              onChange={(e) =>
                setEditingLead({
                  ...editingLead,
                  destination: e.target.value,
                })
              }
              className="w-full border p-2 mb-2"
            />

            <button
              onClick={updateLead}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Save
            </button>

            <button
              onClick={() => setEditingLead(null)}
              className="ml-2 px-4 py-2 border rounded"
            >
              Cancel
            </button>

          </div>
        </div>
      )}

    </div>
  );
}