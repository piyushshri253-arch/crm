"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Admin() {
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");

    // 🔒 SUPER ADMIN CHECK
    if (role !== "super_admin") {
      alert("Access Denied ❌ Super Admin only");
      window.location.href = "/login";
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchLeads(), fetchUsers()]);
    setLoading(false);
  };

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Leads fetch error:", error.message);
      return;
    }

    setLeads(data || []);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, role");

    if (error) {
      console.error("Users fetch error:", error.message);
      return;
    }

    setUsers(data || []);
  };

  // 🔥 ASSIGN LEAD
  const assignLead = async (leadId: string, userId: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from("leads")
      .update({
        assigned_to: userId,
        status: "assigned",
      })
      .eq("id", leadId);

    if (error) {
      console.error("Assign error:", error.message);
      alert("Assignment failed ❌ Check console");
      return;
    }

    fetchLeads();
  };

  const getUserName = (id: string) => {
    const user = users.find((u) => u.id === id);
    return user ? user.name : "Unassigned";
  };

  const employees = users.filter((u) => u.role === "employee");

  // 📊 Dashboard Stats
  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const totalEmployees = employees.length;

    const assignedLeads = leads.filter((lead) => lead.assigned_to).length;
    const pendingLeads = leads.filter(
      (lead) =>
        !lead.status ||
        lead.status.toLowerCase() === "pending" ||
        lead.status.toLowerCase() === "unassigned"
    ).length;

    const successLeads = leads.filter(
      (lead) =>
        lead.status?.toLowerCase() === "success" ||
        lead.status?.toLowerCase() === "closed"
    ).length;

    const followupLeads = leads.filter(
      (lead) => lead.status?.toLowerCase() === "followup"
    ).length;

    return {
      totalLeads,
      totalEmployees,
      assignedLeads,
      pendingLeads,
      successLeads,
      followupLeads,
    };
  }, [leads, employees]);

  // 📈 Employee-wise lead count
  const employeeLeadData = useMemo(() => {
    return employees.map((emp) => {
      const count = leads.filter((lead) => lead.assigned_to === emp.id).length;
      return {
        name: emp.name,
        leads: count,
      };
    });
  }, [employees, leads]);

  // 🥧 Status Data
  const statusData = [
    { name: "Assigned", value: stats.assignedLeads },
    { name: "Pending", value: stats.pendingLeads },
    { name: "Success", value: stats.successLeads },
    { name: "Follow-up", value: stats.followupLeads },
  ];

  const COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#8B5CF6"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-600 text-lg">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            👑 Super Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage leads, employees, analytics and assignments
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl shadow"
        >
          Logout
        </button>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-5 mb-8">
        <StatCard title="Total Leads" value={stats.totalLeads} color="blue" />
        <StatCard title="Employees" value={stats.totalEmployees} color="purple" />
        <StatCard title="Assigned Leads" value={stats.assignedLeads} color="green" />
        <StatCard title="Pending Leads" value={stats.pendingLeads} color="yellow" />
        <StatCard title="Success Leads" value={stats.successLeads} color="emerald" />
        <StatCard title="Follow-up Leads" value={stats.followupLeads} color="pink" />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* BAR CHART */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Employee-wise Lead Assignment
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeeLeadData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leads" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Lead Status Overview
          </h2>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={55}
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* EMPLOYEE LIST + PERFORMANCE */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* EMPLOYEE LIST */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Employee Accounts
          </h2>

          <div className="space-y-3">
            {employees.length > 0 ? (
              employees.map((emp) => {
                const count = leads.filter((lead) => lead.assigned_to === emp.id).length;
                return (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between border rounded-xl px-4 py-3 hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{emp.name}</p>
                      <p className="text-xs text-gray-500">Role: {emp.role}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                      {count} Leads
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No employee accounts found.</p>
            )}
          </div>
        </div>

        {/* TOP PERFORMERS */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Employee Performance Summary
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Employee</th>
                  <th className="p-3 text-left">Assigned Leads</th>
                  <th className="p-3 text-left">Success Leads</th>
                  <th className="p-3 text-left">Follow-up Leads</th>
                  <th className="p-3 text-left">Pending Leads</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const assigned = leads.filter((lead) => lead.assigned_to === emp.id);
                  const success = assigned.filter(
                    (lead) =>
                      lead.status?.toLowerCase() === "success" ||
                      lead.status?.toLowerCase() === "closed"
                  ).length;
                  const followup = assigned.filter(
                    (lead) => lead.status?.toLowerCase() === "followup"
                  ).length;
                  const pending = assigned.filter(
                    (lead) =>
                      !lead.status ||
                      lead.status?.toLowerCase() === "pending" ||
                      lead.status?.toLowerCase() === "assigned"
                  ).length;

                  return (
                    <tr key={emp.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{emp.name}</td>
                      <td className="p-3">{assigned.length}</td>
                      <td className="p-3 text-green-600 font-semibold">{success}</td>
                      <td className="p-3 text-purple-600 font-semibold">{followup}</td>
                      <td className="p-3 text-yellow-600 font-semibold">{pending}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* LEADS TABLE */}
      <div className="bg-white rounded-2xl shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Leads</h2>
          <button
            onClick={loadData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Destination</th>
                <th className="p-3 text-left">Travel Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Assigned To</th>
                <th className="p-3 text-left">Assign Lead</th>
              </tr>
            </thead>
            <tbody>
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-semibold text-gray-800">{lead.name}</div>
                      <div className="text-xs text-gray-500">{lead.email}</div>
                    </td>
                    <td className="p-3">{lead.phone}</td>
                    <td className="p-3">{lead.destination || "-"}</td>
                    <td className="p-3">
                      {lead.start_date || "-"} {lead.end_date ? `to ${lead.end_date}` : ""}
                    </td>
                    <td className="p-3">
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-100 border">
                        {lead.status || "pending"}
                      </span>
                    </td>
                    <td className="p-3 font-medium">
                      {getUserName(lead.assigned_to)}
                    </td>
                    <td className="p-3">
                      <select
                        value={lead.assigned_to || ""}
                        onChange={(e) => assignLead(lead.id, e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded-lg"
                      >
                        <option value="">Unassigned</option>
                        {employees.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 🎨 Reusable Stat Card
function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  const colorMap: any = {
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    emerald: "bg-emerald-100 text-emerald-700",
    pink: "bg-pink-100 text-pink-700",
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
        </div>
        <div className={`px-3 py-2 rounded-xl text-sm font-semibold ${colorMap[color]}`}>
          {title}
        </div>
      </div>
    </div>
  );
}