import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  BookOpen,
  Edit2,
  Save,
  X,
  User,
  Mail,
  ShieldCheck,
  Loader2,
  Camera,
  ZoomIn,
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ImagePlus,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { buildApiUrl, buildAssetUrl, getErrorMessage, parseApiData } from "@/services/api";
import { uploadMaterial, fetchUserMaterials, type StudyMaterial } from "@/services/study-service";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

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
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const getFileType = (file: File | null): StudyMaterial["type"] | "" => {
  if (!file) return "";
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return FILE_TYPE_BY_EXTENSION[extension] || "";
};

/** Canvas-based crop — produces a square blob from the cropped region */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputSize = 400
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas is empty"));
    }, "image/jpeg", 0.92);
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getInitials = (name: string) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  },
} as const;

const typeBadgeColor: Record<string, string> = {
  PDF: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  PPT: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  DOCX: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Markdown: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Video: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  Notes: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const navigate = useNavigate();

  // ── user state ──────────────────────────────────────────────────
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);

  // ── avatar crop state ───────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ── add content state ───────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [creditName, setCreditName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── uploaded content state ──────────────────────────────────────
  const [userMaterials, setUserMaterials] = useState<StudyMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const effectiveCreditName = creditName.trim() || user?.name || "";
  const detectedType = useMemo(() => getFileType(file), [file]);

  /* ── load user ──────────────────────────────────────────────────── */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setName(parsedUser.name);
      setBranch(parsedUser.branch);
      setYear(parsedUser.year);
      if (parsedUser.avatar) {
        setAvatarPreview(parsedUser.avatar);
      }
    } catch (e) {
      console.error(e);
      navigate("/login");
    }
  }, [navigate]);

  /* ── load user materials ────────────────────────────────────────── */
  useEffect(() => {
    if (!token) return;
    setMaterialsLoading(true);
    fetchUserMaterials()
      .then((materials) => setUserMaterials(materials))
      .finally(() => setMaterialsLoading(false));
  }, [token]);

  /* ── profile update ─────────────────────────────────────────────── */
  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(buildApiUrl("/auth/updatedetails"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, branch, year }),
      });

      const data = await res.json();
      const updatedPayload =
        parseApiData<Record<string, unknown> | null>(data, null) ?? data.user;

      if (res.ok && data.success && updatedPayload) {
        const updatedUser = { ...user, ...updatedPayload };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error(getErrorMessage(data, "Update failed"));
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ── avatar flow ────────────────────────────────────────────────── */
  const onAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCropModalOpen(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(selectedFile);

    // Reset input so the same file can be re-selected
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setAvatarUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedBlob);
      setAvatarPreview(previewUrl);

      // Try to upload to the backend
      if (token) {
        const formData = new FormData();
        formData.append("avatar", croppedBlob, "avatar.jpg");

        try {
          const res = await fetch(buildApiUrl("/auth/updateavatar"), {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            const userData = data?.data;
            const avatarUrl = userData?.avatar || userData?.avatarUrl || data?.avatar || previewUrl;
            const resolvedUrl = avatarUrl.startsWith("/") ? buildAssetUrl(avatarUrl) : avatarUrl;
            const updatedUser = { ...user, avatar: resolvedUrl };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setAvatarPreview(resolvedUrl);
            toast.success("Avatar updated!");
          } else {
            // Backend doesn't support avatar upload — store as base64 locally
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;
              const updatedUser = { ...user, avatar: base64 };
              localStorage.setItem("user", JSON.stringify(updatedUser));
              setUser(updatedUser);
              setAvatarPreview(base64);
            };
            reader.readAsDataURL(croppedBlob);
            toast.success("Avatar saved locally");
          }
        } catch {
          // Network error — save locally
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            const updatedUser = { ...user, avatar: base64 };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setAvatarPreview(base64);
          };
          reader.readAsDataURL(croppedBlob);
          toast.success("Avatar saved locally");
        }
      }

      setCropModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to crop image");
    } finally {
      setAvatarUploading(false);
    }
  };

  /* ── add content flow ───────────────────────────────────────────── */
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
      setTitle(
        selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
      );
    }
  };

  const handleContentSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    toast.success("Study content sent for admin review!");
    setTitle("");
    setSubject("");
    setCreditName("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Refresh materials list
    setUserMaterials((prev) => [result, ...prev]);
  };

  /* ── loading state ──────────────────────────────────────────────── */
  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* ── Crop Modal ───────────────────────────────────────────── */}
      {cropModalOpen && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-popover/95 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <ImagePlus className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Crop Avatar</h3>
                  <p className="text-xs text-muted-foreground">Drag to reposition</p>
                </div>
              </div>
              <button
                onClick={() => setCropModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Crop Area */}
            <div className="relative h-72 w-full bg-black/90 sm:h-80">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom Control */}
            <div className="border-t border-border/40 px-5 py-4 space-y-4">
              <div className="flex items-center gap-3">
                <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-1.5 appearance-none  bg-muted accent-primary cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                    [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
                />
                <span className="text-xs tabular-nums text-muted-foreground w-9 text-right">{zoom.toFixed(1)}×</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 "
                  onClick={() => setCropModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 "
                  onClick={handleApplyCrop}
                  disabled={avatarUploading}
                >
                  {avatarUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Apply
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">

        {/* ── Hero / Avatar Section ─────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/30 p-6 sm:p-8">
          {/* Decorative dots */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
          <div className="pointer-events-none absolute -left-4 bottom-0 h-24 w-24 rounded-full bg-primary/3 blur-xl" />

          <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6">
            {/* Avatar with gradient ring */}
            <div className="group relative shrink-0">
              <div className="relative h-28 w-28 rounded-full p-[3px] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-lg shadow-fuchsia-500/10 transition-shadow duration-300 hover:shadow-xl hover:shadow-fuchsia-500/20 sm:h-[120px] sm:w-[120px]">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-background">
                  {avatarPreview || user.avatar ? (
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={avatarPreview || user.avatar}
                        alt={user.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl font-semibold bg-muted">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    /* Default silhouette */
                    <div className="flex h-full w-full items-center justify-center bg-muted/60">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-16 w-16 text-muted-foreground/40 sm:h-20 sm:w-20"
                      >
                        <circle cx="12" cy="8" r="4" fill="currentColor" />
                        <path
                          d="M4 21c0-3.866 3.582-7 8-7s8 3.134 8 7"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Camera overlay */}
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95 sm:h-10 sm:w-10"
                aria-label="Change avatar"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={onAvatarFileChange}
                className="sr-only"
              />
            </div>

            {/* User info */}
            <div className="flex-1 text-center sm:text-left sm:pt-2">
              <h1 className="text-2xl font-bold sm:text-3xl">{user.name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:justify-start">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{user.email}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs font-medium">
                  <Sparkles className="h-3 w-3" />
                  {user.role === "admin"
                    ? "Administrator"
                    : user.role === "faculty"
                      ? "Faculty"
                      : "Student"}
                </Badge>
                {user.isVerified && (
                  <Badge variant="outline" className="gap-1 px-2.5 py-1 text-xs font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>

              {/* Edit Profile button — below the name block */}
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-xl gap-1.5"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Personal Information Card ─────────────────────────── */}
        <Card className="overflow-hidden rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>Manage your profile details</CardDescription>
              </div>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.name);
                    setBranch(user.branch);
                    setYear(user.year);
                  }}
                >
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Academic Branch</Label>
                    <Select
                      value={branch}
                      onValueChange={(val) => setBranch(val || "")}
                      required
                    >
                      <SelectTrigger id="branch">
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer">Computer Engineering</SelectItem>
                        <SelectItem value="IT">Information Technology</SelectItem>
                        <SelectItem value="Civil">Civil Engineering</SelectItem>
                        <SelectItem value="Mechanical">Mechanical Engineering</SelectItem>
                        <SelectItem value="Electrical">Electrical Engineering</SelectItem>
                        <SelectItem value="ENTC">E&TC Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Current Year</Label>
                    <Select
                      value={year}
                      onValueChange={(val) => setYear(val || "")}
                      required
                    >
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FE">First Year (FE)</SelectItem>
                        <SelectItem value="SE">Second Year (SE)</SelectItem>
                        <SelectItem value="TE">Third Year (TE)</SelectItem>
                        <SelectItem value="BE">Final Year (BE)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={loading} className="rounded-xl">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/50 bg-muted/20 transition-colors hover:bg-muted/30">
                  <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Branch</p>
                    <p className="font-semibold text-sm">{user.branch || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/50 bg-muted/20 transition-colors hover:bg-muted/30">
                  <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Current Year</p>
                    <p className="font-semibold text-sm">{user.year || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/50 bg-muted/20 transition-colors hover:bg-muted/30">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Email Status</p>
                    <p className="font-semibold text-sm">{user.isVerified ? "Verified" : "Pending"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/50 bg-muted/20 transition-colors hover:bg-muted/30">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Member Since</p>
                    <p className="font-semibold text-sm">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Add Content Section ────────────────────────────────── */}
        {token && (
          <Card className="overflow-hidden rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <UploadCloud className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Add Content</CardTitle>
                  <CardDescription>Upload study material for admin review</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContentSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="content-title">Title</Label>
                    <Input
                      id="content-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Unit 3 Linked Lists Notes"
                      disabled={submitting}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content-subject">Subject</Label>
                    <Input
                      id="content-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Data Structures"
                      disabled={submitting}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content-credit">Credit name</Label>
                  <Input
                    id="content-credit"
                    value={creditName}
                    onChange={(e) => setCreditName(e.target.value)}
                    placeholder={
                      user?.name
                        ? `Uploaded by ${user.name}`
                        : "Your name"
                    }
                    disabled={submitting}
                    className="rounded-xl"
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
                    className="flex min-h-32 w-full flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border/60 bg-muted/10 px-5 py-6 text-center transition-all duration-200 hover:bg-muted/25 hover:border-primary/30"
                    disabled={submitting}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <UploadCloud className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {file ? file.name : "Choose PDF, PPT, DOCX, or Markdown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {file
                        ? `${detectedType} — ${formatBytes(file.size)}`
                        : "Maximum file size: 50 MB"}
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
                  <div className="flex flex-wrap gap-1.5">
                    {["PDF", "PPT", "DOCX", "Markdown"].map((type) => (
                      <Badge key={type} variant="outline" className="rounded-lg text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl"
                  disabled={submitting || !token}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending for review…
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      Submit Study Content
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ── Your Uploaded Content ──────────────────────────────── */}
        {token && (
          <Card className="overflow-hidden rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Your Uploaded Content</CardTitle>
                  <CardDescription>
                    Track the status of your submissions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {materialsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : userMaterials.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                    <UploadCloud className="h-7 w-7 text-muted-foreground/60" />
                  </div>
                  <h3 className="text-base font-semibold">No uploads yet</h3>
                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    Be the first to share! Upload study material above to help your peers.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {userMaterials.map((material) => {
                    const status = statusConfig[material.status] || statusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                      <div
                        key={material._id}
                        className="group relative flex flex-col gap-3 rounded-xl border border-border/50 bg-card/50 p-4 transition-all duration-200 hover:bg-card hover:shadow-sm hover:border-border"
                      >
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-semibold">
                              {material.title}
                            </h4>
                            <p className="truncate text-xs text-muted-foreground mt-0.5">
                              {material.subject}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`shrink-0 gap-1 rounded-lg text-[10px] font-semibold px-2 py-0.5 ${status.className}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>

                        {/* Footer row */}
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className={`rounded-md text-[10px] font-medium px-2 py-0.5 ${typeBadgeColor[material.type] || ""}`}
                          >
                            {material.type}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDate(material.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
