import { useState, useRef, useMemo, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, UploadCloud, File, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardPanel, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadMaterial, type StudyMaterial } from "@/services/study-service";
import { BRANCHES } from "@/services/api";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const ACCEPTED_FILE_TYPES = ".pdf,.ppt,.pptx,.docx,.md";
const FILE_TYPE_BY_EXTENSION: Record<string, StudyMaterial["type"]> = {
  pdf: "PDF", ppt: "PPT", pptx: "PPT", docx: "DOCX", md: "Markdown",
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

export default function StudentAddContentPage() {
  const { user } = useLocalAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [branch, setBranch] = useState("");
  const [creditName, setCreditName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const effectiveCreditName = creditName.trim() || user?.name || "";
  const detectedType = useMemo(() => getFileType(file), [file]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement> | { target: { files: FileList | null } }) => {
    const selectedFile = event.target.files?.[0] || null;
    if (!selectedFile) return setFile(null);
    
    const type = getFileType(selectedFile);
    if (!type) {
      toast.error("Unsupported file type. Please upload a PDF, PPT, DOCX, or MD file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return setFile(null);
    }
    setFile(selectedFile);
    if (!title.trim()) setTitle(selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleContentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return toast.error("Authentication required.");
    if (!file || !detectedType) return toast.error("Select a supported file.");
    if (!title.trim() || !subject.trim() || !branch) return toast.error("Title, subject, and branch are required.");
    
    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("subject", subject.trim());
    formData.append("branch", branch);
    formData.append("type", detectedType);
    formData.append("author", effectiveCreditName || "Student");
    formData.append("file", file);
    
    const result = await uploadMaterial(formData);
    setSubmitting(false);
    
    if (!result) return toast.error("Submission rejected.");
    toast.success("Content submitted for review.");
    setTitle(""); setSubject(""); setBranch(""); setCreditName(""); setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    navigate("/dashboard/student/uploads");
  };

  return (
    <div className="space-y-6">
      <Alert variant="info" className="border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-300">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-blue-800 dark:text-blue-200 font-semibold">Before You Submit</AlertTitle>
        <AlertDescription className="text-blue-700/80 dark:text-blue-300/80">
          All content submissions undergo an automated review process to ensure high-quality standards. Uploads typically complete and become visible within 24-48 hours.
        </AlertDescription>
      </Alert>

      <Card className="border-border/40 shadow-sm overflow-hidden">
        <CardHeader className="bg-secondary/20 border-b border-border/30 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Upload Material</CardTitle>
              <CardDescription className="mt-1.5">Share notes, presentations, or study guides with your peers.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardPanel className="p-6 sm:p-8">
          <form onSubmit={handleContentSubmit} className="space-y-8">
            {/* File Dropzone */}
            <div className="space-y-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block">1. Select File</span>
              
              <div
                className={cn(
                  "relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ease-in-out",
                  isDragging 
                    ? "border-primary bg-primary/5 scale-[1.02] shadow-sm" 
                    : file 
                      ? "border-emerald-500/50 bg-emerald-500/5" 
                      : "border-border/60 bg-secondary/10 hover:bg-secondary/30 hover:border-border"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <AnimatePresence mode="wait">
                  {file ? (
                    <motion.div 
                      key="file-selected"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{file.name}</p>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          {detectedType} • {formatBytes(file.size)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 underline decoration-muted-foreground/30 underline-offset-4 hover:text-foreground">
                        Click to replace file
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="upload-prompt"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className={cn("flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm border border-border/50 transition-transform duration-300", isDragging ? "-translate-y-2" : "")}>
                        <UploadCloud className={cn("h-7 w-7 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-base font-semibold text-foreground">
                          {isDragging ? "Drop your file here" : "Click or drag file here"}
                        </p>
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                          Supports PDF, PPT, DOCX, or Markdown up to 50MB
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload study material file"
                />
              </div>
            </div>

            <div className="h-px w-full bg-border/40" />

            {/* Metadata Form */}
            <div className="space-y-6">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block">2. Material Details</span>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <Field className="space-y-2.5">
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Unit 3 Trees & Graphs"
                    className="bg-background shadow-sm"
                    required
                  />
                </Field>
                
                <Field className="space-y-2.5">
                  <FieldLabel htmlFor="branch">Branch</FieldLabel>
                  <Select value={branch} onValueChange={(val) => setBranch(val || "")} required>
                    <SelectTrigger id="branch" className="bg-background shadow-sm">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field className="space-y-2.5 sm:col-span-2">
                  <FieldLabel htmlFor="subject">Subject</FieldLabel>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Data Structures & Algorithms"
                    className="bg-background shadow-sm"
                    required
                  />
                </Field>

                <Field className="space-y-2.5 sm:col-span-2">
                  <FieldLabel htmlFor="credit">Credit Name (Optional)</FieldLabel>
                  <Input
                    id="credit"
                    value={creditName}
                    onChange={(e) => setCreditName(e.target.value)}
                    placeholder={`e.g. ${user?.name}'s Notes`}
                    className="bg-background shadow-sm"
                  />
                  <p className="text-xs text-muted-foreground pl-1">
                    This material will be publicly credited to: <span className="font-semibold text-foreground">{effectiveCreditName || "Student"}</span>
                  </p>
                </Field>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/40">
              <Button type="submit" disabled={submitting || !file} size="lg" className="w-full sm:w-auto px-8 shadow-md">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Submit for Review
                    <UploadCloud className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardPanel>
      </Card>
    </div>
  );
}