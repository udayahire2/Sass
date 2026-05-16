import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, BookmarkIcon, Upload, History } from "lucide-react";

interface RecentActivityProps {
  userName?: string;
}

export function RecentActivitySection({ userName }: RecentActivityProps) {
  const navigate = useNavigate();

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-10 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Welcome back
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            {userName ? `Hi ${userName.split(" ")[0]}, ` : ""}Continue your study journey
          </h2>
          <p className="text-sm text-muted-foreground">
            Pick up where you left off, or explore new materials.
          </p>
        </div>

        {/* Quick Action Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Continue Studying */}
          <Card className="p-5 border">
            <div className="flex items-start justify-between mb-4">
              <History className="h-5 w-5 text-muted-foreground" />
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-medium mb-1">Continue studying</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Last viewed: Data Structures - Unit 3
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/resources")}
              className="w-full"
            >
              Resume
            </Button>
          </Card>

          {/* Card 2: Your Bookmarks */}
          <Card className="p-5 border">
            <div className="flex items-start justify-between mb-4">
              <BookmarkIcon className="h-5 w-5 text-muted-foreground" />
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-medium mb-1">Your bookmarks</h3>
            <p className="text-sm text-muted-foreground mb-4">
              8 materials saved for later
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/profile/bookmarks")}
              className="w-full"
            >
              View all
            </Button>
          </Card>

          {/* Card 3: Upload Materials */}
          <Card className="p-5 border">
            <div className="flex items-start justify-between mb-4">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-medium mb-1">Share materials</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Help classmates. Get your uploads approved in 24-48 hours.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/profile/uploads")}
              className="w-full"
            >
              Upload now
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}