import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, FileText, Loader2, ShieldCheck, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { uploadMaterial, type StudyMaterial } from "@/services/study-service";

const ACCEPTED_FILE_TYPES = ".pdf,.ppt,.pptx,.docx,.md";
const FILE_TYPE_BY_EXTENSION: Record<string, StudyMaterial["type"]> = {
  pdf: "PDF",
  ppt: "PPT",
  pptx: "PPT",
  docx: "DOCX",
  md: "Markdown",
};

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const getFileType = (file: File | null): StudyMaterial["type"] | "" => {
  if (!file) return "";
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return FILE_TYPE_BY_EXTENSION[extension] || "";
};

export default function FacultyAddMaterial() {
  const { user } = useLocalAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedMaterial, setSubmittedMaterial] = useState<StudyMaterial | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const detectedType = useMemo(() => getFileType(file), [file]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const type = getFileType(selectedFile);
    if (!type) {
      toast.error("Upload a PDF, PPT, PPTX, DOCX, or Markdown file.");
      event.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
    if (!title.trim()) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      toast.error("Please sign in before uploading study content.");
      return;
    }

    if (!file || !detectedType) {
      toast.error("Choose a supported study file before submitting.");
      return;
    }

    if (!title.trim() || !subject.trim()) {
      toast.error("Add a title and subject so the admin can review it clearly.");
      return;
    }

    setSubmitting(true);
    setSubmittedMaterial(null);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("subject", subject.trim());
    formData.append("type", detectedType);
    formData.append("author", user?.name || "Faculty");
    formData.append("file", file);

    const result = await uploadMaterial(formData);
    setSubmitting(false);

    if (!result) {
      toast.error("Upload failed. Please check your session and try again.");
      return;
    }

    setSubmittedMaterial(result);
    toast.success("Study content sent for admin review.");
    setTitle("");
    setSubject("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Material</h1>
        <p className="text-muted-foreground mt-1">
          Contribute study resources. Your uploads will be reviewed by administrators.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {!token && (
            <Alert variant="warning" className="rounded-xl">
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Sign in required</AlertTitle>
              <AlertDescription>
                <span>Only signed-in users can submit study content.</span>
                <Button asChild variant="outline" className="mt-3 w-fit rounded-md">
                  <Link to="/login">Sign in</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {submittedMaterial && (
            <Alert variant="success" className="rounded-xl">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Submitted for review</AlertTitle>
              <AlertDescription>
                <span>{submittedMaterial.title} is waiting for admin verification.</span>
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Material Details</CardTitle>
              <CardDescription>Enter the specifics of the content you are uploading.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="content-title">Title</Label>
                    <Input
                      id="content-title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="e.g. Unit 3 Linked Lists Notes"
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content-subject">Subject</Label>
                    <Input
                      id="content-subject"
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      placeholder="e.g. Data Structures"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label htmlFor="study-file">Study file</Label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/70 bg-muted/20 px-5 py-8 text-center transition-colors hover:bg-muted/40 hover:border-primary/50"
                    disabled={submitting}
                  >
                    <UploadCloud className="h-10 w-10 text-muted-foreground/50" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {file ? file.name : "Click to upload a document"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file ? `${detectedType} - ${formatBytes(file.size)}` : "Supports PDF, PPT, DOCX, or Markdown up to 50MB"}
                      </p>
                    </div>
                  </button>
                  <Input
                    ref={fileInputRef}
                    id="study-file"
                    type="file"
                    accept={ACCEPTED_FILE_TYPES}
                    onChange={handleFileChange}
                    className="sr-only"
                    disabled={submitting}
                  />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["PDF", "PPT", "DOCX", "Markdown"].map((type) => (
                      <Badge key={type} variant="secondary" className="rounded-full text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full sm:w-auto" disabled={submitting || !token}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading Material...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Submit for Review
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/70 shadow-sm bg-primary/5 dark:bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Admin Review Process
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>To maintain platform quality, all uploads go through a verification process.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>Admins will review the clarity and relevance of your file.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>Approved materials are published with your name as the author.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>You can track approval status on your dashboard.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4 text-primary shrink-0" />
                <span>Provide clear titles that include specific subject and unit numbers.</span>
              </div>
              <div className="flex gap-3 text-sm text-muted-foreground">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span>Ensure scanned documents are easily readable and clearly formatted.</span>
              </div>
              <div className="flex gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>Only upload original work or materials you are authorized to share.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
