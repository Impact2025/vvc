import AdminSidebar from "@/components/layout/AdminSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen">{children}</main>
    </div>
  );
}
