import {
  Check,
  Copy,
  MoreHorizontal,
  Settings2,
  Star,
  Trash2,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NoteMetadata, PageFont } from "@/lib/notesMetadata";
import type { NoteWithMeta } from "./types";
import { useTheme } from "@/components/theme-provider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
  MenuSeparator,
  MenuGroup,
  MenuGroupLabel,
} from "@/components/ui/menu";
import { Switch } from "@/components/ui/switch";

interface NotesEditorHeaderProps {
  title: string;
  metadata: NoteMetadata;
  ancestors: NoteWithMeta[];
  activeNoteId: string | null;
  isSaving: boolean;
  sidebarVisible: boolean;
  onSelectAncestor: (note: NoteWithMeta) => void;
  onToggleFavorite: () => void;
  onToggleSidebar: () => void;
  onToggleFullWidth: () => void;
  onSetFont: (font: PageFont) => void;
  onDuplicate: () => void;
  onTrash: () => void;
  onOpenEmojiPicker: () => void;
  onOpenCoverPicker: () => void;
  onToggleTheme: () => void;
}

export function NotesEditorHeader({
  title,
  metadata,
  ancestors,
  isSaving,
  onSelectAncestor,
  onToggleFavorite,
  onToggleFullWidth,
  onSetFont,
  onDuplicate,
  onTrash,
  onToggleTheme,
}: NotesEditorHeaderProps) {
  const { theme } = useTheme();

  return (
    <header className="relative z-40 flex h-11 shrink-0 select-none items-center justify-between border-b bg-background/80 px-2 backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger render={<SidebarTrigger className="h-7 w-7" />} />
            <TooltipPopup side="bottom">Toggle sidebar</TooltipPopup>
          </Tooltip>
        </TooltipProvider>

        <Breadcrumb>
          <BreadcrumbList className="text-xs sm:gap-1">
            {ancestors.map((anc) => (
              <span key={anc.id} className="inline-flex items-center gap-1">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="flex max-w-[120px] items-center gap-1 truncate text-xs cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectAncestor(anc);
                    }}
                  >
                    {anc.meta.icon && (
                      <span className="text-xs leading-none">{anc.meta.icon}</span>
                    )}
                    <span className="truncate">{anc.title || "Untitled"}</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-muted-foreground/40 text-[10px]">
                  /
                </BreadcrumbSeparator>
              </span>
            ))}

            <BreadcrumbItem>
              <BreadcrumbPage className="flex min-w-0 items-center gap-1 font-medium text-xs">
                {metadata.icon && (
                  <span className="text-xs leading-none">{metadata.icon}</span>
                )}
                <span className="truncate">{title || "Untitled"}</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span className="mr-1 hidden text-xs text-muted-foreground/50 md:inline">
          {isSaving ? "Saving..." : "Saved"}
        </span>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onToggleTheme}
                >
                  {theme === "dark" || (typeof window !== "undefined" && document.documentElement.classList.contains("dark")) ? (
                    <Sun className="h-3.5 w-3.5" />
                  ) : (
                    <Moon className="h-3.5 w-3.5" />
                  )}
                </Button>
              }
            />
            <TooltipPopup side="bottom">Toggle theme</TooltipPopup>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7",
                    metadata.favorite && "text-amber-500 hover:text-amber-600"
                  )}
                  onClick={onToggleFavorite}
                >
                  <Star
                    className={cn(
                      "h-3.5 w-3.5",
                      metadata.favorite && "fill-amber-500"
                    )}
                  />
                </Button>
              }
            />
            <TooltipPopup side="bottom">
              {metadata.favorite ? "Remove from favorites" : "Add to favorites"}
            </TooltipPopup>
          </Tooltip>
        </TooltipProvider>

        <Menu>
          <MenuTrigger
            render={
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
          <MenuPopup align="end" side="bottom" className="w-52">
            <MenuGroup>
              <MenuGroupLabel className="text-[10px] uppercase tracking-wider">
                Style
              </MenuGroupLabel>

              {(
                [
                  ["sans", "Default", "Ag"],
                  ["serif", "Serif", "Ag"],
                  ["mono", "Mono", "Ag"],
                ] as const
              ).map(([font, label, preview]) => (
                <MenuItem
                  key={font}
                  onClick={() => onSetFont(font)}
                  className="justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-4 text-center text-sm font-semibold",
                        font === "serif" && "font-serif",
                        font === "mono" && "font-mono"
                      )}
                    >
                      {preview}
                    </span>
                    <span>{label}</span>
                  </div>
                  {metadata.font === font && (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                </MenuItem>
              ))}
            </MenuGroup>

            <MenuSeparator />

            <MenuItem
              onClick={onToggleFullWidth}
              className="justify-between text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="h-3.5 w-3.5" />
                <span>Full width</span>
              </div>
              <Switch checked={metadata.fullWidth} />
            </MenuItem>

            <MenuSeparator />

            <MenuItem onClick={onDuplicate} className="text-xs">
              <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
            </MenuItem>
            <MenuItem
              variant="destructive"
              onClick={onTrash}
              className="text-xs"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Move to Trash
            </MenuItem>
          </MenuPopup>
        </Menu>
      </div>
    </header>
  );
}
