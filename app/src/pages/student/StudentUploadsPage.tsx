import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Clock, CheckCircle2, XCircle, UploadCloud, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { fetchUserMaterials, type StudyMaterial } from "@/services/study-service";
import { cn } from "@/lib/utils";

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const statusConfig = {
  pending: { label: "In Review", icon: Clock, colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", animate: true },
  approved: { label: "Approved", icon: CheckCircle2, colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", animate: false },
  rejected: { label: "Rejected", icon: XCircle, colorClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20", animate: false },
} as const;

export default function StudentUploadsPage() {
  const [userMaterials, setUserMaterials] = useState<StudyMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;
    setMaterialsLoading(true);
    fetchUserMaterials()
      .then(setUserMaterials)
      .finally(() => setMaterialsLoading(false));
  }, [token]);

  return (
    <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xl">
      <CardHeader className="border-b border-border/30 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              My Uploads
            </CardTitle>
            <CardDescription className="mt-1.5">Track the approval status of study materials you have contributed.</CardDescription>
          </div>
          <Button asChild className="shrink-0 shadow-sm">
            <Link to="/dashboard/student/add-content">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload New
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {materialsLoading ? (
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-transparent border-none shadow-none text-primary">
                <Spinner className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Loading Uploads</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : userMaterials.length === 0 ? (
          <Empty className="py-16 mx-4 sm:mx-0">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-secondary/20">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle className="mt-4">No Uploads Yet</EmptyTitle>
              <EmptyDescription className="max-w-md mx-auto">Get started by sharing your notes, sample papers, or study content with the community.</EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/dashboard/student/add-content">
                <UploadCloud className="mr-2 h-4 w-4" />
                Start Uploading
              </Link>
            </Button>
          </Empty>
        ) : (
          <div className="w-full">
            <Table className="min-w-[600px]">
              <TableHeader className="bg-secondary/30">
                <TableRow className="hover:bg-transparent border-border/30">
                  <TableHead className="w-[45%] pl-6 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Content</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Subject</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Date</TableHead>
                  <TableHead className="pr-6 text-right text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userMaterials.map((m) => {
                  const status = statusConfig[m.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={m._id || m.id} className="group hover:bg-muted/30 transition-colors border-border/30">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background shadow-sm transition-colors group-hover:border-primary/20 group-hover:bg-primary/5">
                            <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-sm text-foreground transition-colors group-hover:text-primary">{m.title}</p>
                            <span className="mt-1 inline-flex items-center rounded border border-border/50 bg-secondary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {m.type}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors">{m.subject}</span>
                      </TableCell>
                      <TableCell className="py-4 text-xs text-muted-foreground font-medium">
                        {formatDate(m.createdAt)}
                      </TableCell>
                      <TableCell className="pr-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Badge className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide border shadow-sm flex items-center gap-1.5 w-fit", status.colorClass)}>
                            {status.animate && (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                              </span>
                            )}
                            {!status.animate && <StatusIcon className="h-3 w-3" />}
                            {status.label}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
