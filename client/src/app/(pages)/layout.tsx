import Sidebar from "@/components/sidebar/Sidebar";
import Navbar from "@/components/sidebar/Navbar";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </div>
  );
}
