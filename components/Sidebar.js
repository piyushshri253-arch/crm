"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5 flex flex-col justify-between">

      {/* TOP MENU */}
      <div>
        <h2 className="text-2xl font-bold mb-6">CRM Panel</h2>

        <nav className="space-y-3">
          <Link href="/" className="block hover:text-blue-400">📊 Dashboard</Link>
          <Link href="/leads" className="block hover:text-blue-400">👤 Leads</Link>
          <Link href="/create" className="block hover:text-blue-400">➕ Create Account</Link>
          <Link href="/followups" className="block hover:text-blue-400">📞 Follow Ups</Link>
          <Link href="/candidates" className="block hover:text-blue-400">🎯 Candidates</Link>
          <Link href="/pending" className="block hover:text-blue-400">⏳ Pending</Link>
          <Link href="/reports" className="block hover:text-blue-400">📈 Reports</Link>
          <Link href="/settings" className="block hover:text-blue-400">⚙️ Settings</Link>
        </nav>
      </div>

      {/* LOGOUT BUTTON */}
      <div className="pt-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}