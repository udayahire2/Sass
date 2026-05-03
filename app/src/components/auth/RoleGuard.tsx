import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Maps a user's role to the dashboard route they should land on.
 * Students (and unauthenticated visitors) stay on the current page.
 */
const ROLE_REDIRECT: Record<string, string> = {
  admin: "/admin/dashboard",
  faculty: "/dashboard/faculty",
};

interface RoleGuardProps {
  /** The page to render when no redirect is needed. */
  children: React.ReactNode;
}

/**
 * Wraps a page that should redirect authenticated non-student users elsewhere.
 *
 * Example: wrapping HomePage so that an admin who navigates to "/" is
 * automatically sent to /admin/dashboard.
 *
 * Reads from localStorage synchronously – no async flicker.
 */
export function RoleGuard({ children }: RoleGuardProps) {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;

      const user = JSON.parse(raw) as { role?: string };
      const redirectTo = user.role ? ROLE_REDIRECT[user.role] : undefined;

      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      }
    } catch {
      // Malformed user in localStorage — do nothing, let them view the page.
    }
  }, [navigate]);

  return <>{children}</>;
}
