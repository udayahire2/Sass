import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ROUTE_LABELS } from "@/config/navigation";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";
import { useLocalAuth } from "@/hooks/use-local-auth";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useLocalAuth();
  const mainRef = useRef<HTMLElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
    } else if (!user && !localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate, user]);

  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    const handleScroll = () => {
      setShowScrollTop(mainEl.scrollTop > 240);
    };

    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // O(1) lookup; fallback to Dashboard if route is just "/admin"
  const currentPage = ROUTE_LABELS[location.pathname] ?? "Dashboard";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <SidebarProvider>
        <AdminSidebar />
        
        <SidebarInset className="flex flex-col flex-1 h-screen w-full min-w-0 overflow-hidden relative">
          <AdminHeader currentPage={currentPage} />
          
          {/* Page Content */}
          <main 
            ref={mainRef}
            className="flex-1 overflow-y-auto bg-background px-4 py-6 sm:px-6 lg:px-8 relative scroll-smooth"
          >
            <div className="mx-auto w-full max-w-7xl animate-in fade-in duration-500">
              <Outlet />
            </div>

            {/* Scroll to Top Arrow */}
            {showScrollTop && (
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Scroll to top of page"
                className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary/90 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
