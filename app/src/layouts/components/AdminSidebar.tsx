import { Link, useLocation } from "react-router-dom";
import { LogOut, ChevronUp } from "lucide-react";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { ADMIN_NAV_SECTIONS, ROUTES } from "@/config/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";
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

export function AdminSidebar() {
  const location = useLocation();
  const { user, logout, getInitials } = useLocalAuth();

  const displayName = user?.name || "Admin User";
  const displayEmail = user?.email || "admin@studyhub.com";

  return (
    <Sidebar>
      <SidebarHeader className="h-14 flex flex-row items-center justify-between px-4 border-b border-border bg-background">
        <Link
          className="min-w-0 flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          to={ROUTES.ADMIN_DASHBOARD}
        >
          <Logo />
        </Link>
        <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">
          Admin
        </Badge>
      </SidebarHeader>

      <SidebarContent>
        <div className="space-y-4 py-4">
          {ADMIN_NAV_SECTIONS.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const isActive =
                      location.pathname === item.path ||
                      (location.pathname === "/admin" && item.path === ROUTES.ADMIN_DASHBOARD);

                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton isActive={isActive} render={<Link to={item.path} />}>
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
              <Button
                type="button"
                variant="ghost"
                className="w-full h-full flex items-center justify-start gap-3 p-2 rounded-md hover:bg-secondary transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none"
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
              <span className="truncate text-sm font-medium leading-none mb-1.5">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground leading-none">{displayEmail}</span>
            </div>
            <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto shrink-0 opacity-50" aria-hidden="true" />
          </MenuTrigger>

          <MenuPopup className="w-56 rounded-xl shadow-lg">
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