import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ROUTE_LABELS } from "@/config/navigation";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";
import { useLocalAuth } from "@/hooks/use-local-auth";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useLocalAuth();

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
    } else if (!user && !localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate, user]);

  // O(1) lookup; fallback to Dashboard if route is just "/admin"
  const currentPage = ROUTE_LABELS[location.pathname] ?? "Dashboard";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <SidebarProvider>
        <AdminSidebar />
        
        <SidebarInset className="flex flex-col flex-1 h-screen w-full min-w-0 overflow-hidden">
          <AdminHeader currentPage={currentPage} />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-background px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl animate-in fade-in duration-500">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}