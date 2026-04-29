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

export default function AddStudyContentPage() {
  const { user } = useLocalAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [creditName, setCreditName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedMaterial, setSubmittedMaterial] = useState<StudyMaterial | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const effectiveCreditName = creditName.trim() || user?.name || "";
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
    formData.append("author", effectiveCreditName || "Student");
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
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:py-14">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-7">
          <div className="space-y-4">
            <Badge variant="secondary" className="w-fit rounded-md px-3 py-1 text-xs">
              Add Your Study Content
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Share notes that helped you study.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Upload PDF, PPT, DOCX, or Markdown material for admin review. Approved content is published with your name as credit.
              </p>
            </div>
          </div>

          {!token && (
            <Alert variant="warning" className="rounded-md">
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
            <Alert variant="success" className="rounded-md">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Submitted for review</AlertTitle>
              <AlertDescription>
                <span>{submittedMaterial.title} is waiting for admin verification.</span>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 rounded-md border border-border/60 bg-background p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="content-title">Title</Label>
                <Input
                  id="content-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Unit 3 Linked Lists Notes"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-subject">Subject</Label>
                <Input
                  id="content-subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Data Structures"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content-credit">Credit name</Label>
              <Input
                id="content-credit"
                value={creditName}
                onChange={(event) => setCreditName(event.target.value)}
                placeholder={user?.name ? `Uploaded by ${user.name}` : "Uploaded by Uday Ahire"}
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground">
                Published credit: Uploaded by {effectiveCreditName || "your name"}
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="study-file">Study file</Label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border/70 bg-muted/20 px-5 py-8 text-center transition-colors hover:bg-muted/40"
                disabled={submitting}
              >
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {file ? file.name : "Choose PDF, PPT, DOCX, or Markdown"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {file ? `${detectedType} - ${formatBytes(file.size)}` : "Maximum file size: 50 MB"}
                </span>
              </button>
              <input
                ref={fileInputRef}
                id="study-file"
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                onChange={handleFileChange}
                className="sr-only"
                disabled={submitting}
              />
              <div className="flex flex-wrap gap-2">
                {["PDF", "PPT", "DOCX", "Markdown"].map((type) => (
                  <Badge key={type} variant="outline" className="rounded-md">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full rounded-md" disabled={submitting || !token}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending for review
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Submit Study Content
                </>
              )}
            </Button>
          </form>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="space-y-4 rounded-md border border-border/60 bg-card/40 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-background">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Admin review</h2>
                <p className="text-xs text-muted-foreground">Verification before publishing</p>
              </div>
            </div>
            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>Admins check quality, relevance, and file clarity.</p>
              <p>Approved uploads appear on the website with your credit.</p>
              <p>Rejected uploads stay unpublished.</p>
            </div>
          </section>

          <section className="space-y-3 rounded-md border border-border/60 bg-card/40 p-5">
            <h2 className="text-sm font-semibold text-foreground">Good submissions</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <BookOpen className="mt-0.5 h-4 w-4 text-primary" />
                <span>Clear titles with subject and unit names</span>
              </div>
              <div className="flex gap-2">
                <FileText className="mt-0.5 h-4 w-4 text-primary" />
                <span>Readable scans, complete slides, and clean formatting</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>Original work or material you have permission to share</span>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
