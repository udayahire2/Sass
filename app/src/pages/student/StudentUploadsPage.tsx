import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Clock, CheckCircle2, XCircle, UploadCloud } from "lucide-react";
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
  pending: { label: "Pending", icon: Clock, className: "bg-muted text-muted-foreground border-transparent" },
  approved: { label: "Approved", icon: CheckCircle2, className: "bg-muted text-muted-foreground border-transparent" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-muted text-muted-foreground border-transparent" },
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
    <Card className="border-border/70 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-4 bg-secondary/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          My Uploads
        </CardTitle>
        <CardDescription>Track the approval status of study materials you have contributed.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 px-0 sm:px-6">
        {materialsLoading ? (
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Spinner className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle>Loading Uploads</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : userMaterials.length === 0 ? (
          <Empty className="mx-4 sm:mx-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle>No Uploads Yet</EmptyTitle>
              <EmptyDescription>Get started by sharing your notes, sample papers, or study content with the community.</EmptyDescription>
            </EmptyHeader>
            <Button variant="outline">
                <UploadCloud className="mr-2 h-4 w-4" />
              <Link to="/dashboard/student/add-content">
                Upload Material
              </Link>
            </Button>
          </Empty>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/70 mx-4 sm:mx-0">
            <div className="overflow-x-auto">
              <Table className="min-w-160">
                <TableHeader className="bg-secondary/60">
                  <TableRow>
                    <TableHead className="w-70">Content</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userMaterials.map((m) => {
                    const status = statusConfig[m.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={m._id || m.id} className="hover:bg-secondary/20 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl border border-border/70 bg-secondary p-2.5">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-sm text-foreground">{m.title}</p>
                              <span className="mt-1 inline-block rounded border border-border/80 bg-muted/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                {m.type}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-sm">{m.subject}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {formatDate(m.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className={cn("rounded-full px-2.5 py-0.5 font-normal text-xs border-transparent capitalize w-fit",
                            m.status === "approved" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                            m.status === "rejected" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" :
                            "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          )}>
                            <StatusIcon className="mr-1 h-3.5 w-3.5 inline-block align-middle" />
                            <span className="align-middle">{status.label}</span>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
