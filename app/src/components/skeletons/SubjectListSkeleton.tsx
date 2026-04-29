import { Skeleton } from "@/components/ui/skeleton";

export function SubjectListSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 my-12">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-8 w-64" />
      </div>

      <div className="grid gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-lg border border-border/60 bg-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Skeleton className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SubjectListSkeleton;
