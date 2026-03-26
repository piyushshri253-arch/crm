"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function Charts({ leads }) {
  const data = [
    { name: "Total", value: leads.length },
    { name: "Pending", value: leads.filter(l => l.status === "pending").length },
    { name: "Success", value: leads.filter(l => l.status === "success").length },
  ];

  return (
    <div className="bg-white p-5 rounded shadow mt-6">
      <h2 className="mb-4 font-bold">Lead Analytics</h2>

      <BarChart width={400} height={300} data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#3b82f6" />
      </BarChart>
    </div>
  );
}