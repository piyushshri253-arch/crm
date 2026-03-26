"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Header() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  // 👤 LOAD USER
  useEffect(() => {
    const storedName = localStorage.getItem("name") || "User";
    const storedEmail = localStorage.getItem("email") || "";
    const storedId = localStorage.getItem("user_id");

    setName(storedName);
    setEmail(storedEmail);
    setUserId(storedId);
  }, []);

  // 🔔 FETCH NOTIFICATIONS
  const fetchNotifications = async (id: string) => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    if (!error) {
      setNotifications(data || []);
    }
  };

  // 🔥 REALTIME FIXED (IMPORTANT)
  useEffect(() => {
    if (!userId) return;

    let channel: any;

    const init = async () => {
      await fetchNotifications(userId);

      channel = supabase
        .channel("notifications-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`, // ✅ IMPORTANT FIX (server-side filter)
          },
          (payload) => {
            setNotifications((prev) => [payload.new, ...prev]);
          }
        )
        .subscribe();
    };

    init();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // 🧹 CLEAR NOTIFICATIONS
  const markRead = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (!error) setNotifications([]);
  };

  return (
    <div className="w-full h-16 bg-white shadow flex items-center justify-between px-6">

      {/* LOGO */}
      <div className="text-xl font-bold">CRM Dashboard</div>

      <div className="flex items-center gap-6">

        {/* 🔔 BELL */}
        <div className="relative cursor-pointer" onClick={() => setOpen(!open)}>

          <span className="text-2xl">🔔</span>

          {notifications.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
              {notifications.length}
            </span>
          )}

          {/* DROPDOWN */}
          {open && (
            <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded p-3 z-50">

              <div className="flex justify-between mb-2">
                <h3 className="font-bold">Notifications</h3>
                <button
                  onClick={markRead}
                  className="text-xs text-blue-500"
                >
                  Clear
                </button>
              </div>

              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No notifications
                </p>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className="border-b py-1 text-sm">
                    {n.message}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm">{name}</span>
            <span className="text-xs text-gray-500">{email}</span>
          </div>

        </div>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>

      </div>
    </div>
  );
}