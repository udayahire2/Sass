import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  BookOpen,
  Edit2,
  Save,
  User,
  Mail,
  Loader2,
  Camera,
  ZoomIn,
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Bookmark,
  ExternalLink,
  Home,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

import { buildApiUrl, buildAssetUrl, buildAvatarUrl, getErrorMessage, parseApiData } from "@/services/api";
import { uploadMaterial, fetchUserMaterials, fetchBookmarkedMaterials, toggleBookmark, type StudyMaterial } from "@/services/study-service";

// ----------------------------------------------------------------------
// Helpers (unchanged)
// ----------------------------------------------------------------------

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

async function getCroppedImg(imageSrc: string, pixelCrop: Area, outputSize = 400): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, outputSize, outputSize);
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

const formatDate = (dateString?: string) => {
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
    className: "border-border bg-muted text-muted-foreground",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "border-border bg-muted text-muted-foreground",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "border-border bg-muted text-muted-foreground",
  },
} as const;

const typeBadgeColor: Record<string, string> = {
  PDF: "border-border bg-muted text-muted-foreground",
  PPT: "border-border bg-muted text-muted-foreground",
  DOCX: "border-border bg-muted text-muted-foreground",
  Markdown: "border-border bg-muted text-muted-foreground",
};

type LocalProfileUser = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string | null;
  role?: "student" | "faculty" | "admin";
  branch?: string;
  year?: string;
  createdAt?: string;
  isVerified?: boolean;
};

const validTabs = ["profile", "add-content", "uploads", "bookmarks", "notes"] as const;
type TabType = (typeof validTabs)[number];

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export default function ProfilePage() {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab: string }>();
  const initialTab = validTabs.includes(tab as TabType) ? (tab as TabType) : "profile";

  const [user, setUser] = useState<LocalProfileUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  useEffect(() => {
    if (tab && validTabs.includes(tab as TabType)) setActiveTab(tab as TabType);
    else setActiveTab("profile");
  }, [tab]);

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    if (newTab === "notes") {
      navigate("/notes");
    } else {
      navigate(newTab === "profile" ? "/profile" : `/profile/${newTab}`);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);

  // Avatar crop
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Add content
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [creditName, setCreditName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Uploads & bookmarks
  const [userMaterials, setUserMaterials] = useState<StudyMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState<StudyMaterial[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const effectiveCreditName = creditName.trim() || user?.name || "";
  const detectedType = useMemo(() => getFileType(file), [file]);

  // Load user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    try {
      const parsedUser = JSON.parse(storedUser) as LocalProfileUser;
      if (parsedUser.role === "admin") navigate("/admin/dashboard");
      if (parsedUser.role === "faculty") navigate("/dashboard/faculty");
      setUser(parsedUser);
      setName(parsedUser.name);
      setBranch(parsedUser.branch || "");
      setYear(parsedUser.year || "");
      if (parsedUser.avatar) setAvatarPreview(parsedUser.avatar);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // Load user materials & bookmarks
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
      setBookmarkedMaterials((prev) => prev.filter((m) => String(m.id || m._id) !== materialId));
      toast.success("Bookmark removed");
    }
  };

  // Profile update
  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(buildApiUrl("/auth/updatedetails"), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, branch, year }),
      });
      const data = await res.json();
      const updatedPayload = parseApiData<Partial<LocalProfileUser> | null>(data, null) ?? data.user;
      if (res.ok && data.success && updatedPayload) {
        const updatedUser = { ...user, ...updatedPayload } as LocalProfileUser;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        window.dispatchEvent(new CustomEvent("auth-change"));
        setIsEditing(false);
        toast.success("Profile updated");
      } else {
        toast.error(getErrorMessage(data, "Update failed"));
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Avatar flow
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
      if (!token) throw new Error("No token");
      const formData = new FormData();
      formData.append("avatar", new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" }));
      const res = await fetch(buildApiUrl("/auth/updateavatar"), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload failed");
      const rawAvatarPath: string = data?.avatar_url || data?.data?.avatar || data?.data?.avatarUrl || "";
      if (!rawAvatarPath) throw new Error("No avatar URL returned");
      const resolvedUrl = rawAvatarPath.startsWith("http") ? rawAvatarPath : buildAvatarUrl(rawAvatarPath);
      const updatedUser = { ...user, avatar: resolvedUrl } as LocalProfileUser;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setAvatarPreview(resolvedUrl);
      window.dispatchEvent(new CustomEvent("auth-change"));
      setCropModalOpen(false);
      toast.success("Avatar updated!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Avatar update failed");
    } finally {
      setAvatarUploading(false);
    }
  };

  // Upload content
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

  const handleContentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      toast.error("Please sign in first.");
      return;
    }
    if (!file || !detectedType) {
      toast.error("Choose a supported file.");
      return;
    }
    if (!title.trim() || !subject.trim()) {
      toast.error("Add a title and subject.");
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
      toast.error("Upload failed.");
      return;
    }
    toast.success("Content sent for review!");
    setTitle("");
    setSubject("");
    setCreditName("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUserMaterials((prev) => [result, ...prev]);
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isStudent = user.role === "student";

  return (
    <SidebarProvider>
      <Sidebar className="border-border bg-background">
        <SidebarHeader className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
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
                  <SidebarMenuButton onClick={() => navigate("/")}>
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => handleTabChange("profile")} isActive={activeTab === "profile"}>
                    <User className="h-4 w-4" />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {token && isStudent && (
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => handleTabChange("add-content")} isActive={activeTab === "add-content"}>
                      <UploadCloud className="h-4 w-4" />
                      <span>Add Content</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {token && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={() => handleTabChange("uploads")} isActive={activeTab === "uploads"}>
                        <FileText className="h-4 w-4" />
                        <span>My Uploads</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={() => handleTabChange("bookmarks")} isActive={activeTab === "bookmarks"}>
                        <Bookmark className="h-4 w-4" />
                        <span>Bookmarks</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={() => handleTabChange("notes")} isActive={activeTab === "notes"}>
                        <FileText className="h-4 w-4" />
                        <span>My Notes</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">{activeTab.replace("-", " ")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex-1 overflow-auto bg-background p-4 sm:p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Avatar Crop Dialog */}
            <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
              <DialogContent className="border-border bg-card shadow-sm sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-semibold tracking-tight">Crop Avatar</DialogTitle>
                  <DialogDescription>Drag to reposition the image</DialogDescription>
                </DialogHeader>
                <div className="relative h-64 w-full overflow-hidden rounded-md border border-border bg-muted">
                  {imageSrc && (
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
                  )}
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <ZoomIn className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs tabular-nums text-muted-foreground w-9 text-right">
                    {zoom.toFixed(1)}x
                  </span>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="border-border bg-background shadow-none hover:bg-muted/50"
                    onClick={() => setCropModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-muted text-foreground shadow-none hover:bg-muted/50"
                    onClick={handleApplyCrop}
                    disabled={avatarUploading}
                  >
                    {avatarUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Apply
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="rounded-lg border-border bg-card shadow-none md:col-span-1">
                  <CardContent className="flex flex-col items-center pt-6 text-center">
                    <div className="relative mb-4">
                      <div className="h-28 w-28 rounded-full border border-border bg-muted">
                        {avatarPreview || user.avatar ? (
                          <img
                            src={avatarPreview || user.avatar || undefined}
                            alt={user.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <DefaultAvatar name={user.name} size={112} className="h-full w-full rounded-full" />
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full border-border bg-background text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground"
                        onClick={() => avatarInputRef.current?.click()}
                        aria-label="Change avatar"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <input ref={avatarInputRef} type="file" accept="image/*" onChange={onAvatarFileChange} className="hidden" />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">{user.name}</h3>
                    <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                    <Badge variant="secondary" className="mt-2 border-border bg-muted capitalize text-muted-foreground">
                      {user.role === "admin" ? "Administrator" : user.role === "faculty" ? "Faculty" : "Student"}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="rounded-lg border-border bg-card shadow-none md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="font-semibold tracking-tight">Personal Information</CardTitle>
                      <CardDescription>Update your academic and personal details</CardDescription>
                    </div>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border bg-background shadow-none hover:bg-muted/50"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="branch">Branch</Label>
                            <Select value={branch} onValueChange={(val) => setBranch(val || "")} required>
                              <SelectTrigger id="branch">
                                <SelectValue placeholder="Select branch" />
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
                            <Label htmlFor="year">Year</Label>
                            <Select value={year} onValueChange={(val) => setYear(val || "")} required>
                              <SelectTrigger id="year">
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="FE">FE</SelectItem>
                                <SelectItem value="SE">SE</SelectItem>
                                <SelectItem value="TE">TE</SelectItem>
                                <SelectItem value="BE">BE</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-border pt-4">
                          <Button
                            type="button"
                            variant="ghost"
                            className="shadow-none hover:bg-muted/50"
                            onClick={() => {
                              setIsEditing(false);
                              setName(user.name);
                              setBranch(user.branch || "");
                              setYear(user.year || "");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-muted text-foreground shadow-none hover:bg-muted/50"
                            disabled={loading}
                          >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" /> Full Name
                          </dt>
                          <dd className="text-sm font-medium">{user.name}</dd>
                        </div>
                        <div>
                          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" /> Email
                          </dt>
                          <dd className="text-sm font-medium break-all">{user.email}</dd>
                        </div>
                        <div>
                          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" /> Branch
                          </dt>
                          <dd className="text-sm font-medium">{user.branch || "-"}</dd>
                        </div>
                        <div>
                          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4" /> Year
                          </dt>
                          <dd className="text-sm font-medium">{user.year || "-"}</dd>
                        </div>
                        <div>
                          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" /> Member Since
                          </dt>
                          <dd className="text-sm font-medium">{formatDate(user.createdAt)}</dd>
                        </div>
                      </dl>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Add Content Tab */}
            {activeTab === "add-content" && token && isStudent && (
              <Card className="rounded-lg border-border bg-card shadow-none">
                <CardHeader>
                  <CardTitle className="font-semibold tracking-tight">Add Study Content</CardTitle>
                  <CardDescription>Share study materials with your peers</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContentSubmit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Unit 3 Linked Lists Notes" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Data Structures" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="credit">Credit Name (optional)</Label>
                      <Input id="credit" value={creditName} onChange={(e) => setCreditName(e.target.value)} placeholder={`Uploaded by ${user.name}`} />
                      <p className="text-xs text-muted-foreground">Published credit: Uploaded by {effectiveCreditName || "your name"}</p>
                    </div>
                    <div className="space-y-3">
                      <Label>Study file</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background p-5 text-center shadow-none hover:bg-muted/50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <UploadCloud className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{file ? file.name : "Choose PDF, PPT, DOCX, or Markdown"}</span>
                        <span className="text-xs text-muted-foreground">
                          {file ? `${detectedType} - ${formatBytes(file.size)}` : "Maximum file size: 50 MB"}
                        </span>
                      </Button>
                      <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} onChange={handleFileChange} className="hidden" />
                      <div className="flex flex-wrap gap-1.5">
                        {["PDF", "PPT", "DOCX", "Markdown"].map((t) => (
                          <Badge key={t} variant="outline" className="border-border bg-background text-xs text-muted-foreground">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-muted text-foreground shadow-none hover:bg-muted/50"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="mr-2 h-4 w-4" /> Submit for Review
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* My Uploads Tab */}
            {activeTab === "uploads" && token && (
              <Card className="rounded-lg border-border bg-card shadow-none">
                <CardHeader>
                  <CardTitle className="font-semibold tracking-tight">My Uploads</CardTitle>
                  <CardDescription>Track the status of your shared materials</CardDescription>
                </CardHeader>
                <CardContent>
                  {materialsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : userMaterials.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                      <UploadCloud className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No uploads yet</p>
                      <Button
                        variant="outline"
                        className="border-border bg-background shadow-none hover:bg-muted/50"
                        onClick={() => setActiveTab("add-content")}
                      >
                        Add Content
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {userMaterials.map((m) => {
                        const status = statusConfig[m.status] || statusConfig.pending;
                        const StatusIcon = status.icon;
                        return (
                          <div key={m._id} className="space-y-3 rounded-md border border-border bg-card p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-semibold tracking-tight">{m.title}</h4>
                                <p className="text-xs text-muted-foreground">{m.subject}</p>
                              </div>
                              <Badge variant="outline" className={status.className}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {status.label}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <Badge variant="secondary" className={typeBadgeColor[m.type] || ""}>
                                {m.type}
                              </Badge>
                              <span className="text-muted-foreground">{formatDate(m.createdAt)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Bookmarks Tab */}
            {activeTab === "bookmarks" && token && (
              <Card className="rounded-lg border-border bg-card shadow-none">
                <CardHeader>
                  <CardTitle className="font-semibold tracking-tight">Bookmarked Content</CardTitle>
                  <CardDescription>Your saved study materials</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookmarksLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : bookmarkedMaterials.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                      <Bookmark className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No bookmarks yet</p>
                      <Button
                        variant="outline"
                        className="border-border bg-background shadow-none hover:bg-muted/50"
                        onClick={() => navigate("/resources")}
                      >
                        Browse Materials
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {bookmarkedMaterials.map((m) => {
                        const href =
                          m.url || (m.filePath ? buildAssetUrl(m.filePath, { studyMaterialId: m.id || m._id }) : "");
                        return (
                          <div key={m._id} className="space-y-3 rounded-md border border-border bg-card p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-semibold tracking-tight">{m.title}</h4>
                                <p className="text-xs text-muted-foreground">{m.subject}</p>
                              </div>
                              <Badge variant="secondary" className={typeBadgeColor[m.type] || ""}>
                                {m.type}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">By {m.author}</span>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground"
                                  onClick={() => handleRemoveBookmark(String(m.id || m._id))}
                                  aria-label="Remove bookmark"
                                >
                                  <Bookmark className="h-3.5 w-3.5 fill-current" />
                                </Button>
                                {href && (
                                  <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="h-7 border-border bg-background px-2 text-xs shadow-none hover:bg-muted/50"
                                  >
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

            {/* Notes Tab - placeholder (you can implement later) */}
            {activeTab === "notes" && token && (
              <Card className="rounded-lg border-border bg-card shadow-none">
                <CardHeader>
                  <CardTitle className="font-semibold tracking-tight">My Notes</CardTitle>
                  <CardDescription>Your personal notes (coming soon)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-12 text-center text-muted-foreground">Notes feature is under development.</div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
