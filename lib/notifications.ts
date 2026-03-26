export const addNotification = (message: string) => {
  const existing = JSON.parse(localStorage.getItem("notifications") || "[]");

  const updated = [
    {
      message,
      time: new Date().toISOString(),
    },
    ...existing,
  ];

  localStorage.setItem("notifications", JSON.stringify(updated));
};