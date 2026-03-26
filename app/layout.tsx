import "./globals.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen flex bg-gray-100">

        {/* LEFT SIDEBAR */}
        <Sidebar />

        {/* RIGHT SECTION */}
        <div className="flex flex-col flex-1">

          {/* TOP HEADER */}
          <Header />

          {/* MAIN CONTENT */}
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>

        </div>

      </body>
    </html>
  );
}