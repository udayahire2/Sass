import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Button } from "../components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DefaultAvatar } from "@/components/ui/DefaultAvatar";
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
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { buildApiUrl, buildAssetUrl, getErrorMessage, parseApiData } from "@/services/api";
import { uploadMaterial, fetchUserMaterials, fetchBookmarkedMaterials, toggleBookmark, type StudyMaterial } from "@/services/study-service";
import {
  NotionPage,
  NotionCover,
  NotionContent,
  NotionHeaderArea,
  NotionAvatarWrapper,
  NotionTitle,
  NotionTitleBadge,
  NotionProperties,
  NotionPropertyRow,
  NotionSection,
  NotionGallery,
  NotionGalleryCard,
  NotionFormContainer,
  NotionEmptyState,
} from "@/components/profile/NotionLayout";

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

  // ── bookmarked content state ────────────────────────────────────
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState<StudyMaterial[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

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

    setBookmarksLoading(true);
    fetchBookmarkedMaterials()
      .then((materials) => setBookmarkedMaterials(materials))
      .finally(() => setBookmarksLoading(false));
  }, [token]);

  const handleRemoveBookmark = async (materialId: string) => {
    if (!token) return;
    const result = await toggleBookmark(materialId);
    if (result.success && !result.bookmarked) {
      setBookmarkedMaterials(prev => prev.filter(m => String(m.id || m._id) !== materialId));
      toast.success("Bookmark removed");
    }
  };

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
        window.dispatchEvent(new CustomEvent("auth-change"));
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
            const avatarUrl = data?.avatar_url || userData?.avatar || userData?.avatarUrl || data?.avatar || previewUrl;
            const resolvedUrl = avatarUrl.startsWith("/") ? buildAssetUrl(avatarUrl) : avatarUrl;
            const updatedUser = { ...user, avatar: resolvedUrl };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setAvatarPreview(resolvedUrl);
            window.dispatchEvent(new CustomEvent("auth-change"));
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
              window.dispatchEvent(new CustomEvent("auth-change"));
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
            window.dispatchEvent(new CustomEvent("auth-change"));
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
    <NotionPage>
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
              <Button onClick={() => setCropModalOpen(false)} variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
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
            <div className="space-y-4 border-t border-border/40 px-5 py-4">
              <div className="flex items-center gap-3">
                <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
                <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
                  {zoom.toFixed(1)}×
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCropModalOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleApplyCrop} disabled={avatarUploading}>
                  {avatarUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Apply
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <NotionCover />

      <NotionContent>
        {/* ── Header & Profile Info ──────────────────────────────── */}
        <NotionHeaderArea>
          <NotionAvatarWrapper>
            <div className="group relative">
              <div className="relative h-28 w-28 rounded-xl bg-background p-1 shadow-sm transition-shadow hover:shadow-md sm:h-32 sm:w-32">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {avatarPreview || user.avatar ? (
                    <img
                      src={avatarPreview || user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <DefaultAvatar name={user.name} size={128} className="h-full w-full rounded-lg" />
                  )}
                </div>
              </div>
              <Button
                variant="secondary"
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md"
                onClick={() => avatarInputRef.current?.click()}
                aria-label="Change avatar"
              >
                <Camera className="h-4 w-4" />
              </Button>
              <Input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={onAvatarFileChange}
                className="sr-only"
              />
            </div>
          </NotionAvatarWrapper>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <NotionTitle>
                {user.name}
                <NotionTitleBadge>
                  {user.role === "admin"
                    ? "Administrator"
                    : user.role === "faculty"
                      ? "Faculty"
                      : "Student"}
                </NotionTitleBadge>
                {user.isVerified && (
                  <NotionTitleBadge>
                    <ShieldCheck className="mr-1 inline-block h-3 w-3 text-emerald-500" />
                    Verified
                  </NotionTitleBadge>
                )}
              </NotionTitle>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>

            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="mr-2 h- 4 w-4" /> Edit Profile
              </Button>
            )}
          </div>

          <NotionProperties>
            {isEditing ? (
              <NotionFormContainer>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
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
                      <Select value={branch} onValueChange={(val) => setBranch(val || "")} required>
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
                      <Select value={year} onValueChange={(val) => setYear(val || "")} required>
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
                  <div className="flex justify-end gap-2 border-t border-border/40 pt-4 mt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user.name);
                        setBranch(user.branch);
                        setYear(user.year);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </NotionFormContainer>
            ) : (
              <>
                <NotionPropertyRow
                  icon={BookOpen}
                  label="Academic Branch"
                  value={user.branch || "Not specified"}
                />
                <NotionPropertyRow
                  icon={CalendarDays}
                  label="Current Year"
                  value={user.year || "Not specified"}
                />
                <NotionPropertyRow
                  icon={User}
                  label="Member Since"
                  value={formatDate(user.createdAt)}
                />
              </>
            )}
          </NotionProperties>
        </NotionHeaderArea>

        {/* ── Add Content Section ────────────────────────────────── */}
        {token && (
          <NotionSection title="Add Study Content" icon={UploadCloud}>
            <NotionFormContainer>
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
                    placeholder={user?.name ? `Uploaded by ${user.name}` : "Your name"}
                    disabled={submitting}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Published credit: Uploaded by {effectiveCreditName || "your name"}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="study-file">Study file</Label>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex min-h-[8rem] w-full flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border/60 bg-muted/10 px-5 py-6 text-center transition-all duration-200 hover:border-primary/30 hover:bg-muted/25"
                    disabled={submitting}
                    variant="ghost"
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
                  </Button>
                  <Input
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

                <Button type="submit" className="w-full rounded-xl" disabled={submitting || !token}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending for review…
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Submit Study Content
                    </>
                  )}
                </Button>
              </form>
            </NotionFormContainer>
          </NotionSection>
        )}

        {/* ── Your Uploaded Content ──────────────────────────────── */}
        {token && (
          <NotionSection title="Your Uploaded Content" icon={FileText}>
            {materialsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : userMaterials.length === 0 ? (
              <NotionEmptyState
                icon={UploadCloud}
                title="No uploads yet"
                description="Be the first to share! Upload study material above to help your peers."
              />
            ) : (
              <NotionGallery>
                {userMaterials.map((material) => {
                  const status = statusConfig[material.status] || statusConfig.pending;
                  const StatusIcon = status.icon;

                  return (
                    <NotionGalleryCard key={material._id}>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-semibold">{material.title}</h4>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {material.subject}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`shrink-0 gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${status.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-3">
                        <Badge
                          variant="secondary"
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${typeBadgeColor[material.type] || ""}`}
                        >
                          {material.type}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(material.createdAt)}
                        </span>
                      </div>
                    </NotionGalleryCard>
                  );
                })}
              </NotionGallery>
            )}
          </NotionSection>
        )}

        {/* ── Bookmarked Content ─────────────────────────────────── */}
        {token && (
          <NotionSection
            title="Bookmarked Content"
            icon={Bookmark}
            action={
              bookmarkedMaterials.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/resources")}>
                  Browse more
                </Button>
              )
            }
          >
            {bookmarksLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : bookmarkedMaterials.length === 0 ? (
              <NotionEmptyState
                icon={Bookmark}
                title="No bookmarks yet"
                description="You haven't bookmarked any study materials. Explore the Study Materials section and save what you find useful."
                action={
                  <Button variant="outline" className="rounded-xl" onClick={() => navigate("/resources")}>
                    Browse Materials
                  </Button>
                }
              />
            ) : (
              <NotionGallery>
                {bookmarkedMaterials.map((material) => {
                  const href =
                    material.url ||
                    (material.filePath
                      ? buildAssetUrl(material.filePath, { studyMaterialId: material.id || material._id })
                      : "");
                  return (
                    <NotionGalleryCard key={material._id}>
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-semibold">{material.title}</h4>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {material.subject}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${typeBadgeColor[material.type] || ""}`}
                        >
                          {material.type}
                        </Badge>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-3">
                        <span className="text-[11px] text-muted-foreground">
                          By {material.author}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-red-500"
                            onClick={() => handleRemoveBookmark(String(material.id || material._id))}
                            title="Remove bookmark"
                          >
                            <Bookmark className="h-3.5 w-3.5 fill-current" />
                          </Button>
                          {href && (
                            <Button asChild variant="outline" size="sm" className="h-7 rounded-lg px-2 text-xs">
                              <a href={href} target="_blank" rel="noreferrer">
                                Open <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </NotionGalleryCard>
                  );
                })}
              </NotionGallery>
            )}
          </NotionSection>
        )}
      </NotionContent>
    </NotionPage>
  );
}
