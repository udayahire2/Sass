import { useState, useEffect, useRef, useCallback } from "react";
import type { FormEvent, ChangeEvent } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Camera, ZoomIn, Edit2, Save, Mail, BookOpen, CalendarDays, Clock } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DefaultAvatar } from "@/components/ui/DefaultAvatar";
import { buildApiUrl, buildAvatarUrl, getErrorMessage, parseApiData } from "@/services/api";

// ------------------------------------------------------------
// Cropping utilities (unchanged)
// ------------------------------------------------------------
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
  return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

type LocalProfileUser = {
  id?: string; _id?: string; name: string; email: string; avatar?: string | null;
  role?: "student" | "faculty" | "admin"; branch?: string; year?: string; createdAt?: string; isVerified?: boolean;
};

export default function StudentProfilePage() {
  const [user, setUser] = useState<LocalProfileUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    try {
      const parsedUser = JSON.parse(storedUser) as LocalProfileUser;
      setUser(parsedUser);
      setName(parsedUser.name);
      setBranch(parsedUser.branch || "");
      setYear(parsedUser.year || "");
      if (parsedUser.avatar) setAvatarPreview(parsedUser.avatar);
    } catch {
      // ignore
    }
  }, []);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
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
        toast.success("Profile updated seamlessly.");
      } else {
        toast.error(getErrorMessage(data, "Update failed"));
      }
    } catch {
      toast.error("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const onAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) return toast.error("Please select a valid image.");
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

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => setCroppedAreaPixels(croppedPixels), []);

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setAvatarUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!token) throw new Error("Authentication missing.");
      const formData = new FormData();
      formData.append("avatar", new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" }));
      const res = await fetch(buildApiUrl("/auth/updateavatar"), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload rejected.");
      const rawAvatarPath = data?.avatar_url || data?.data?.avatar || data?.data?.avatarUrl || "";
      if (!rawAvatarPath) throw new Error("No URL provided by server.");
      const resolvedUrl = rawAvatarPath.startsWith("http") ? rawAvatarPath : buildAvatarUrl(rawAvatarPath);
      const updatedUser = { ...user, avatar: resolvedUrl } as LocalProfileUser;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setAvatarPreview(resolvedUrl);
      window.dispatchEvent(new CustomEvent("auth-change"));
      setCropModalOpen(false);
      toast.success("Avatar updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Process failed.");
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Crop Modal */}
      <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
        <DialogContent className="border-border/70 bg-card shadow-lg sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Crop Avatar</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">Reposition your image before saving to your profile.</DialogDescription>
          </DialogHeader>
          <div className="relative h-64 w-full overflow-hidden rounded-xl border border-border bg-muted">
            {imageSrc && (
              <Cropper
                image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round"
                showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
            <Input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-foreground" />
            <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{zoom.toFixed(1)}x</span>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCropModalOpen(false)}>Cancel</Button>
            <Button variant="default" onClick={handleApplyCrop} disabled={avatarUploading}>
              {avatarUploading ? "Saving..." : "Apply"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Card */}
      <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--card)_92%,var(--color-amber-50))_0%,var(--card)_55%,color-mix(in_srgb,var(--card)_90%,var(--color-stone-100))_100%)] p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-background bg-muted shadow-md transition-all duration-300 group-hover:scale-102 group-hover:border-primary/20">
              {avatarPreview || user?.avatar ? (
                <img src={avatarPreview || user?.avatar || undefined} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <DefaultAvatar name={user?.name || "User"} size={112} className="h-full w-full" />
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <Input ref={avatarInputRef} type="file" accept="image/*" onChange={onAvatarFileChange} className="hidden" />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <h2 className="text-2xl font-bold tracking-tight">{user?.name}</h2>
              <Badge className="rounded-full px-2.5 py-0.5 font-semibold text-[10px] border-border/50 bg-secondary/80 text-foreground uppercase tracking-wider">
                Student
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5 md:justify-start">
              <Mail className="h-3.5 w-3.5 text-muted-foreground/80" />
              {user?.email}
            </p>
          </div>
        </div>
      </Card>

      {/* Personal Information Card */}
      <Card className="border-border/70 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Personal Information</CardTitle>
            <CardDescription>View and manage your academic profile details.</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                {/* Branch */}
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select value={branch} onValueChange={(val) => setBranch(val ?? "")} required>
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Computer", "IT", "Civil", "Mechanical", "Electrical", "ENTC"].map(b => (
                        <SelectItem key={b} value={b}>{b} Engineering</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Year */}
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select value={year} onValueChange={(val) => setYear(val ?? "")} required>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {["FE", "SE", "TE", "BE"].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setName(user?.name || "");
                    setBranch(user?.branch || "");
                    setYear(user?.year || "");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : <><Save className="mr-2 h-3.5 w-3.5" /> Save Changes</>}
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Branch */}
              <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3.5 shadow-sm transition-all hover:bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-border/70 bg-secondary p-2.5">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Branch</p>
                    <p className="text-sm font-semibold mt-0.5">{user?.branch ? `${user.branch} Engg.` : "Not specified"}</p>
                  </div>
                </div>
              </div>

              {/* Academic Year */}
              <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3.5 shadow-sm transition-all hover:bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-border/70 bg-secondary p-2.5">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Academic Year</p>
                    <p className="text-sm font-semibold mt-0.5">{user?.year || "Not specified"}</p>
                  </div>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3.5 shadow-sm transition-all hover:bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-border/70 bg-secondary p-2.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Member Since</p>
                    <p className="text-sm font-semibold mt-0.5">{formatDate(user?.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
