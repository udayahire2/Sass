import { SearchIcon } from "lucide-react";
import { NavbarThemeToggle } from "@/components/layout/navbar/navbar-theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface AdminHeaderProps {
  currentPage: string;
}

export function AdminHeader({ currentPage }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-4 sm:gap-6 sm:px-6 lg:px-8">
      <SidebarTrigger className="h-8 w-8 -ml-2 text-muted-foreground" />

      <div className="min-w-0 flex-1 flex items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <span className="text-muted-foreground">Admin</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground">
                {currentPage}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <form 
          className="w-fit hidden sm:flex" 
          onSubmit={(e) => {
            e.preventDefault();
            // Handle search
          }}
        >
          <InputGroup>
            <InputGroupInput
              aria-label="Search"
              placeholder="Search students, approvals..."
              type="search"
            />
            <InputGroupAddon>
              <button type="submit" aria-label="Submit search">
                <SearchIcon aria-hidden="true" className="h-4 w-4" />
              </button>
            </InputGroupAddon>
          </InputGroup>
        </form>
        
        <NavbarThemeToggle />
      </div>
    </header>
  );
}