import { ArrowLeft, SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";
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
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-8 w-8 -ml-2 text-muted-foreground" />
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-foreground"
          title="Go to website root (/)"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Go to Home</span>
        </Link>
      </div>

      <div className="min-w-0 flex-1 flex items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                Root
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
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
             
                <SearchIcon aria-hidden="true" className="h-4 w-4" />
            </InputGroupAddon>
          </InputGroup>
        </form>
        
        <NavbarThemeToggle />
      </div>
    </header>
  );
}
