import { useEffect, useState } from "react";
import { Bookmark, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

// REPLACED Card imports with Frame imports
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";

import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

import { Spinner } from "@/components/ui/spinner";

import {
  fetchBookmarkedMaterials,
  toggleBookmark,
  type StudyMaterial,
} from "@/services/study-service";

import { buildAssetUrl } from "@/services/api";
import { Button } from "@/components/ui/button";

export default function StudentBookmarksPage() {
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState<
    StudyMaterial[]
  >([]);

  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  useEffect(() => {
    if (!token) return;

    const loadBookmarks = async () => {
      try {
        const materials = await fetchBookmarkedMaterials();
        setBookmarkedMaterials(materials);
      } finally {
        setLoading(false);
      }
    };

    void loadBookmarks();
  }, [token]);

  const handleRemoveBookmark = async (materialId: string) => {
    const result = await toggleBookmark(materialId);

    if (result.success && !result.bookmarked) {
      setBookmarkedMaterials((prev) =>
        prev.filter(
          (material) =>
            String(material.id || material._id) !== materialId
        )
      );

      toast.success("Bookmark removed");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-3 text-center">
          <Spinner className="mx-auto h-6 w-6" />
          <p className="text-sm text-muted-foreground">
            Loading saved materials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Saved Materials
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Access all bookmarked notes, PDFs and resources in one place.
        </p>
      </div>

      {/* Empty State */}
      {bookmarkedMaterials.length === 0 ? (
        <Frame className="w-full">
          <FramePanel className="py-16">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Bookmark className="h-5 w-5" />
                </EmptyMedia>

                <EmptyTitle>
                  No saved materials yet
                </EmptyTitle>

                <EmptyDescription>
                  Save notes, PDFs and study resources while
                  browsing. They will appear here for quick access.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </FramePanel>
        </Frame>
      ) : (
        <Frame className="w-full">
          <FrameHeader>
            <FrameTitle>
              {bookmarkedMaterials.length} Saved Material
              {bookmarkedMaterials.length !== 1 ? "s" : ""}
            </FrameTitle>

            <FrameDescription>
              Your personal collection of bookmarked resources.
            </FrameDescription>
          </FrameHeader>

          <FramePanel className="p-0">
            <div className="divide-y">
              {bookmarkedMaterials.map((material) => {
                const href =
                  material.url ||
                  (material.filePath
                    ? buildAssetUrl(material.filePath, {
                        studyMaterialId:
                          material.id || material._id,
                      })
                    : "");

                return (
                  <div
                    key={material.id || material._id}
                    className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-foreground line-clamp-2">
                        {material.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {material.subject && (
                          <span className="text-sm text-muted-foreground">
                            {material.subject}
                          </span>
                        )}

                        {material.type && (
                          <Badge variant="secondary">
                            {material.type}
                          </Badge>
                        )}

                        {material.author && (
                          <span className="text-sm text-muted-foreground">
                            By {material.author}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {href && (
                       <Button variant={"default"}>
                         <ExternalLink className="h-4 w-4" />
                         <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                       </Button>
                      )}

                      <Button
                      variant={"secondary"}
                        onClick={() =>
                          handleRemoveBookmark(
                            String(material.id || material._id)
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </FramePanel>
        </Frame>
      )}
    </div>
  );
}