import { Outlet, useLocation } from "react-router-dom";

import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export default function Layout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const isResourcesPage = location.pathname.startsWith("/resources");

  return (
    <div className="relative flex min-h-screen flex-col bg-transparent">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <Navbar />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
        <main id="main-content" className="relative flex-1">
          {children || <Outlet />}
        </main>
      </div>

      {!isResourcesPage && <Footer />}
    </div>
  );
}
