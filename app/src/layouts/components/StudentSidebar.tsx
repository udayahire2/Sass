import { Link, useLocation } from "react-router-dom";
import {
  Bookmark,
  ChevronUp,
  Edit2,
  Files,
  LayoutDashboard,
  LogOut,
  UploadCloud,
  User,
} from "lucide-react";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { Logo } from "@/components/ui/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export const STUDENT_NAV_SECTIONS = [
  {
    label: "Workspace",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/student" },
      {
        icon: UploadCloud,
        label: "Upload Material",
        path: "/dashboard/student/add-content",
      },
      { icon: Files, label: "My Uploads", path: "/dashboard/student/uploads" },
    ],
  },
  {
    label: "Library",
    items: [
      {
        icon: Bookmark,
        label: "Bookmarks",
        path: "/dashboard/student/bookmarks",
      },
      { icon: Edit2, label: "Notes", path: "/notes" },
    ],
  },
  {
    label: "Account",
    items: [
      { icon: User, label: "Profile", path: "/dashboard/student/profile" },
    ],
  },
];

export function StudentSidebar() {
  const location = useLocation();
  const { user, logout, getInitials } = useLocalAuth();

  const displayName = user?.name || "Student User";
  const displayEmail = user?.email || "student@studyhub.com";

  return (
    <Sidebar>
      <SidebarHeader className="h-14 flex flex-row items-center justify-between px-4 border-b border-border bg-background">
        <Link
          className="min-w-0 flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          to="/dashboard/student"
        >
          <Logo />
        </Link>
        <Badge
          variant="secondary"
          className="font-mono text-[10px] uppercase tracking-wider"
        >
          Student
        </Badge>
      </SidebarHeader>

      <SidebarContent>
        <div className="space-y-4 py-4">
          {STUDENT_NAV_SECTIONS.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const STUDENT_ROOT = "/dashboard/student";
                    const isActive =
                      location.pathname === item.path ||
                      (location.pathname === STUDENT_ROOT && item.path === STUDENT_ROOT);

                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          render={<Link to={item.path} />}
                        >
                          <item.icon className="h-4 w-4" aria-hidden="true" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border">
        <Menu>
          <MenuTrigger
            render={
              // FIX: Swapped bloaty <Button> for a clean, semantic HTML button built for custom layouts
              <button
                type="button"
                className="w-full flex items-center justify-start gap-3 p-2 rounded-md hover:bg-secondary transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none"
              />
            }
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user?.avatar} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start overflow-hidden text-left flex-1">
              {/* FIX: Swapped span for div on block-level truncated text to respect HTML semantics */}
              <div className="truncate w-full text-sm font-medium leading-none mb-1.5">
                {displayName}
              </div>
              <div className="truncate w-full text-xs text-muted-foreground leading-none">
                {displayEmail}
              </div>
            </div>
            <ChevronUp
              className="h-4 w-4 text-muted-foreground ml-auto shrink-0 opacity-50"
              aria-hidden="true"
            />
          </MenuTrigger>

          <MenuPopup className="w-56 rounded-xl shadow-lg">
            <MenuItem render={<Link to="/dashboard/student/profile" />}>
              <User className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Profile Settings
            </MenuItem>
            <MenuSeparator />
            <MenuItem onClick={logout} closeOnClick>
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" /> Sign out
            </MenuItem>
          </MenuPopup>
        </Menu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
