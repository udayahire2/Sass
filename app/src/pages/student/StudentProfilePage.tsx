import { useState, useEffect, useRef, useCallback } from "react";
import type { FormEvent, ChangeEvent } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Camera, ZoomIn, Edit2, Save, Mail, BookOpen, CalendarDays, Clock, ShieldCheck, X } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

// ------------------------------------------------------------
// Cropping utilities
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
        toast.success("Profile details updated securely.");
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
      toast.success("Avatar updated successfully.");
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
        <DialogContent className="border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Reposition Avatar</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">Pinch or use the slider to zoom and drag to adjust.</DialogDescription>
          </DialogHeader>
          <div className="relative h-64 w-full overflow-hidden rounded-xl border border-border/50 bg-black/5 dark:bg-white/5">
            {imageSrc && (
              <Cropper
                image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round"
                showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex items-center gap-4 pt-2">
            <ZoomIn className="h-5 w-5 text-muted-foreground" />
            <Input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 cursor-ew-resize accent-primary" />
            <span className="w-10 text-right text-xs font-medium tabular-nums text-muted-foreground">{zoom.toFixed(1)}x</span>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" className="rounded-xl" onClick={() => setCropModalOpen(false)}>Cancel</Button>
            <Button variant="default" className="rounded-xl shadow-md px-6" onClick={handleApplyCrop} disabled={avatarUploading}>
              {avatarUploading ? "Processing..." : "Save Avatar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Identity Card */}
      <Card className="overflow-hidden border-border/40 shadow-sm bg-card relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--color-primary)_10%,transparent)_0%,transparent_100%)] opacity-50" />
        <CardContent className="p-8 relative">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-background bg-secondary shadow-lg transition-transform duration-500 ease-out group-hover:scale-105 group-hover:shadow-primary/20">
                {avatarPreview || user?.avatar ? (
                  <img src={avatarPreview || user?.avatar || undefined} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <DefaultAvatar name={user?.name || "User"} size={112} className="h-full w-full" />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Camera className="h-8 w-8 text-white drop-shadow-md" />
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm ring-2 ring-background">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <Input ref={avatarInputRef} type="file" accept="image/*" onChange={onAvatarFileChange} className="hidden" />
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-2 md:items-start">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">{user?.name}</h2>
                  <Badge className="rounded-full px-3 py-0.5 font-bold text-[10px] bg-primary/10 text-primary border-transparent uppercase tracking-widest shadow-sm">
                    Student Account
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted/50 px-3 py-1 rounded-full border border-border/50">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Setup */}
      <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-5 border-b border-border/30 flex flex-row items-center justify-between bg-secondary/10">
          <div>
            <CardTitle className="text-lg">Academic Profile</CardTitle>
            <CardDescription className="mt-1">Manage your academic details and preferences.</CardDescription>
          </div>
          <AnimatePresence mode="wait">
            {!isEditing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="shadow-sm rounded-lg">
                  <Edit2 className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Info
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>
        
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.form 
                key="edit-form"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleUpdate} 
                className="space-y-6"
              >
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="space-y-2.5">
                    <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background shadow-sm" required />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="branch" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Engineering Branch</Label>
                    <Select value={branch} onValueChange={(val) => setBranch(val ?? "")} required>
                      <SelectTrigger id="branch" className="bg-background shadow-sm">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Computer", "IT", "Civil", "Mechanical", "Electrical", "ENTC"].map(b => (
                          <SelectItem key={b} value={b}>{b} Engineering</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="year" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Academic Year</Label>
                    <Select value={year} onValueChange={(val) => setYear(val ?? "")} required>
                      <SelectTrigger id="year" className="bg-background shadow-sm">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {["FE", "SE", "TE", "BE"].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-lg"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user?.name || "");
                      setBranch(user?.branch || "");
                      setYear(user?.year || "");
                    }}
                  >
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="rounded-lg shadow-md px-6">
                    {loading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Details</>}
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="view-mode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid gap-4 sm:grid-cols-3"
              >
                {/* Branch Card */}
                <div className="group flex items-center justify-between rounded-2xl border border-border/40 bg-secondary/10 p-5 transition-all hover:bg-secondary/30 hover:border-border/60 hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-background p-3 shadow-sm border border-border/50 text-blue-500 transition-transform group-hover:scale-110">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Branch</p>
                      <p className="text-sm font-semibold text-foreground">{user?.branch ? `${user.branch} Engg.` : "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Year Card */}
                <div className="group flex items-center justify-between rounded-2xl border border-border/40 bg-secondary/10 p-5 transition-all hover:bg-secondary/30 hover:border-border/60 hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-background p-3 shadow-sm border border-border/50 text-amber-500 transition-transform group-hover:scale-110">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Academic Year</p>
                      <p className="text-sm font-semibold text-foreground">{user?.year || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Member Since Card */}
                <div className="group flex items-center justify-between rounded-2xl border border-border/40 bg-secondary/10 p-5 transition-all hover:bg-secondary/30 hover:border-border/60 hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-background p-3 shadow-sm border border-border/50 text-emerald-500 transition-transform group-hover:scale-110">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Member Since</p>
                      <p className="text-sm font-semibold text-foreground">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
