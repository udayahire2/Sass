import { useState, useRef, useMemo, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadMaterial, type StudyMaterial } from "@/services/study-service";
import { BRANCHES } from "@/services/api";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const effectiveCreditName = creditName.trim() || user?.name || "";
  const detectedType = useMemo(() => getFileType(file), [file]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (!selectedFile) return setFile(null);
    
    const type = getFileType(selectedFile);
    if (!type) {
      toast.error("Unsupported file type.");
      event.target.value = "";
      return setFile(null);
    }
    setFile(selectedFile);
    if (!title.trim()) setTitle(selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
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
      <Alert variant="info" className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Before You Submit</AlertTitle>
        <AlertDescription>
          All content submissions undergo an automated review process. You'll receive notifications as your submission progresses through approval stages. Uploads typically complete within 24-48 hours.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Add Study Content</CardTitle>
          </div>
          <CardDescription>Upload notes, presentations, or documents. Your submission will go through an approval workflow.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContentSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unit 3 Trees"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select value={branch} onValueChange={setBranch} required>
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Data Structures"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit">Credit Name (Optional)</Label>
              <Input
                id="credit"
                value={creditName}
                onChange={(e) => setCreditName(e.target.value)}
                placeholder={`e.g. Uday's Notes`}
              />
              <p className="text-xs text-muted-foreground">
                Displays as: Uploaded by <span className="font-medium text-foreground">{effectiveCreditName || "Student"}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label>File Attachment</Label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border p-6 text-center transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {file ? file.name : "Click to select a file"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {file
                    ? `${detectedType} • ${formatBytes(file.size)}`
                    : "PDF, PPT, DOCX, or Markdown (Max 50MB)"}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload study material file"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}