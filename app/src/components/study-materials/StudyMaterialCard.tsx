import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, ExternalLink, Download } from "lucide-react";
import { getIcon, getResourceColor } from "./utils";
import type { StudyMaterial } from "./types";

interface StudyMaterialCardProps {
  resource: StudyMaterial;
  onView: (resource: StudyMaterial) => void;
}

export function StudyMaterialCard({ resource, onView }: StudyMaterialCardProps) {
  const colors = getResourceColor(resource.type);

  return (
    <Card className="group flex h-full flex-col rounded-md border border-border/40 bg-transparent transition-colors hover:border-border">
      <CardHeader className="space-y-3 p-4 pb-2">
        {/* Icon and Type */}
        <div className="flex items-start justify-between">
          <div className={`rounded-md border border-border/40 p-2 ${colors.text}`}>
            {getIcon(resource.type)}
          </div>
          <div className="flex gap-1">
            <Badge variant="outline" className="rounded-md border-border/40 text-xs font-normal">
              {resource.type}
            </Badge>
            {resource.isNew && (
              <Badge variant="outline" className="rounded-md border-border/40 text-xs font-normal">
                New
              </Badge>
            )}
          </div>
        </div>

        {/* Title and Subject */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{resource.subject}</span>
            <span className="text-muted-foreground">{resource.rating || "—"}</span>
          </div>
          <CardTitle className="text-base font-medium leading-snug">
            {resource.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground">By {resource.author}</p>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-3 p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {resource.description || "Comprehensive study material covering key concepts."}
        </p>

        {/* Metadata row */}
        <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {resource.views}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {resource.duration || "—"}
            </span>
          </div>
          <span>{resource.semester || "—"}</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button
          className="h-9 flex-1 rounded-md text-sm font-normal"
          onClick={() => onView(resource)}
        >
          {resource.type.toLowerCase() === "video" ? "Watch" : "View"}
          <ExternalLink className="ml-2 h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-md border border-border/40"
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}