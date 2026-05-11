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
import { buildApiUrl, buildAssetUrl, buildAvatarUrl, getErrorMessage, parseApiData } from "@/services/api";
import { uploadMaterial, fetchUserMaterials, fetchBookmarkedMaterials, toggleBookmark, type StudyMaterial } from "@/services/study-service";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const [activeTab, setActiveTab] = useState<"profile" | "add-content" | "uploads" | "bookmarks">("profile");
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
      
      // Redirect admins and faculty to their respective dashboards
      if (parsedUser.role === "admin") {
        navigate("/admin/dashboard");
        return;
      }
      if (parsedUser.role === "faculty") {
        navigate("/dashboard/faculty");
        return;
      }

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

      if (!token) {
        toast.error("You must be signed in to update your avatar.");
        setCropModalOpen(false);
        return;
      }

      // Build FormData — set explicit filename + type so multer fileFilter gets the right MIME
      const formData = new FormData();
      formData.append("avatar", new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" }));

      const res = await fetch(buildApiUrl("/auth/updateavatar"), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        // Show the real server error so it's not silently masked
        toast.error(data?.message || `Upload failed (${res.status})`);
        return;
      }

      // The server returns { success, data: user, avatar_url: '/uploads/avatars/...' }
      // Use avatar_url from root or from data.avatar / data.avatarUrl
      const rawAvatarPath: string =
        data?.avatar_url ||
        data?.data?.avatar ||
        data?.data?.avatarUrl ||
        data?.legacy?.avatar_url ||
        "";

      if (!rawAvatarPath) {
        toast.error("Upload succeeded but avatar URL was missing in response.");
        return;
      }

      // Build absolute URL pointing to the backend static server
      const resolvedUrl = rawAvatarPath.startsWith("http")
        ? rawAvatarPath
        : buildAvatarUrl(rawAvatarPath);

      // Update all state sources
      const updatedUser = { ...user, avatar: resolvedUrl };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setAvatarPreview(resolvedUrl);
      window.dispatchEvent(new CustomEvent("auth-change"));
      setCropModalOpen(false);
      toast.success("Avatar updated successfully!");
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error("Something went wrong while uploading your avatar.");
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

  const isStudent = user.role === "student";

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="h-16 border-b flex items-center px-4">
          <div className="font-semibold text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>My Profile</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab("profile")} 
                    isActive={activeTab === "profile"}
                  >
                    <User className="h-4 w-4" />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {token && isStudent && (
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveTab("add-content")} 
                      isActive={activeTab === "add-content"}
                    >
                      <UploadCloud className="h-4 w-4" />
                      <span>Add Content</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                
                {token && (
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveTab("uploads")} 
                      isActive={activeTab === "uploads"}
                    >
                      <FileText className="h-4 w-4" />
                      <span>My Uploads</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {token && (
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveTab("bookmarks")} 
                      isActive={activeTab === "bookmarks"}
                    >
                      <Bookmark className="h-4 w-4" />
                      <span>Bookmarks</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">{activeTab.replace('-', ' ')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        
        <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-8">
            
            {/* Crop Modal */}
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

            {/* Content Based on Tab */}
            {activeTab === "profile" && (
              <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                {/* Left Side: Avatar and Quick Stats */}
                <div className="md:col-span-1 lg:col-span-1 space-y-6">
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                      <div className="group relative shrink-0 mb-4">
                        <div className="relative h-32 w-32 rounded-full bg-background p-1 shadow-sm transition-shadow hover:shadow-md border">
                          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-muted">
                            {avatarPreview || user.avatar ? (
                              <img
                                src={avatarPreview || user.avatar}
                                alt={user.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <DefaultAvatar name={user.name} size={128} className="h-full w-full rounded-full" />
                            )}
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
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
                      
                      <h3 className="font-semibold text-lg flex items-center gap-1.5 justify-center">
                        {user.name}
                        {user.isVerified && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                      </h3>
                      <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                      <Badge variant="secondary" className="mt-3 capitalize">
                        {user.role === "admin" ? "Administrator" : user.role === "faculty" ? "Faculty" : "Student"}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Side: Details */}
                <div className="md:col-span-2 lg:col-span-3 space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your academic and personal details here.</CardDescription>
                      </div>
                      {!isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="pt-6">
                      {isEditing ? (
                        <form onSubmit={handleUpdate} className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
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
                          <div className="flex justify-end gap-2 border-t pt-4 mt-6">
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
                      ) : (
                        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div className="flex flex-col gap-1">
                            <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <User className="h-4 w-4" /> Full Name
                            </dt>
                            <dd className="text-sm font-semibold">{user.name}</dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <Mail className="h-4 w-4" /> Email Address
                            </dt>
                            <dd className="text-sm font-semibold break-all">{user.email}</dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <BookOpen className="h-4 w-4" /> Academic Branch
                            </dt>
                            <dd className="text-sm font-semibold">{user.branch || "Not specified"}</dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" /> Current Year
                            </dt>
                            <dd className="text-sm font-semibold">{user.year || "Not specified"}</dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <Clock className="h-4 w-4" /> Member Since
                            </dt>
                            <dd className="text-sm font-semibold">{formatDate(user.createdAt)}</dd>
                          </div>
                        </dl>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "add-content" && token && isStudent && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Study Content</CardTitle>
                  <CardDescription>Share study materials like PDFs, notes, or presentations with your peers.</CardDescription>
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
                        className="flex min-h-[8rem] w-full flex-col items-center justify-center gap-2.5 border-2 border-dashed border-border/60 bg-muted/10 px-5 py-6 text-center transition-all duration-200 hover:border-primary/30 hover:bg-muted/25"
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
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting || !token}>
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
                </CardContent>
              </Card>
            )}

            {activeTab === "uploads" && token && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Uploaded Content</CardTitle>
                  <CardDescription>Track the status of the materials you've shared.</CardDescription>
                </CardHeader>
                <CardContent>
                  {materialsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : userMaterials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg border-dashed">
                      <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="font-semibold text-lg">No uploads yet</h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-sm">Be the first to share! Upload study material to help your peers.</p>
                      <Button className="mt-6" onClick={() => setActiveTab('add-content')}>Add Content</Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {userMaterials.map((material) => {
                        const status = statusConfig[material.status] || statusConfig.pending;
                        const StatusIcon = status.icon;

                        return (
                          <div key={material._id} className="group relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
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

                            <div className="mt-auto flex items-center justify-between border-t pt-3">
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
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "bookmarks" && token && (
              <Card>
                <CardHeader>
                  <CardTitle>Bookmarked Content</CardTitle>
                  <CardDescription>Your saved study materials for quick access.</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookmarksLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : bookmarkedMaterials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg border-dashed">
                      <Bookmark className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="font-semibold text-lg">No bookmarks yet</h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-sm">You haven't bookmarked any study materials. Explore the resources section and save what you find useful.</p>
                      <Button className="mt-6" onClick={() => navigate("/resources")} variant="outline">Browse Materials</Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {bookmarkedMaterials.map((material) => {
                        const href =
                          material.url ||
                          (material.filePath
                            ? buildAssetUrl(material.filePath, { studyMaterialId: material.id || material._id })
                            : "");
                        return (
                          <div key={material._id} className="group relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
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

                            <div className="mt-auto flex items-center justify-between border-t pt-3">
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
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
