import { useState, useEffect, useRef, useCallback } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DefaultAvatar } from "@/components/ui/DefaultAvatar";
import { Badge } from "@/components/ui/badge";
import {
  Edit2,
  Save,
  User,
  Mail,
  ShieldCheck,
  Loader2,
  Camera,
  ZoomIn,
  CheckCircle2,
  Briefcase,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { buildApiUrl, buildAvatarUrl, getErrorMessage, parseApiData } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// ──────────────────────────────────────────────────────────────
// Crop utility (unchanged)
// ──────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────

export default function FacultyProfile() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [designation, setDesignation] = useState("");
  const [loading, setLoading] = useState(false);

  // Avatar state
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
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setName(parsedUser.name || "");
      setDepartment(parsedUser.department || "");
      setCollegeName(parsedUser.collegeName || "");
      setDesignation(parsedUser.designation || "");
      if (parsedUser.avatar) setAvatarPreview(parsedUser.avatar);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(buildApiUrl("/auth/updatedetails"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, department, collegeName, designation }),
      });
      const data = await res.json();
      const updatedPayload = parseApiData<Record<string, unknown> | null>(data, null) ?? data.user;
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

  // Avatar handlers
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
      const rawAvatarPath: string =
        data?.avatar_url || data?.data?.avatar || data?.data?.avatarUrl || "";
      if (!rawAvatarPath) throw new Error("No avatar URL returned");
      const resolvedUrl = rawAvatarPath.startsWith("http") ? rawAvatarPath : buildAvatarUrl(rawAvatarPath);
      const updatedUser = { ...user, avatar: resolvedUrl };
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

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faculty Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information and academic credentials.
        </p>
      </div>

      {/* Avatar Crop Modal – shadcn Dialog */}
      <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Avatar</DialogTitle>
            <DialogDescription>Drag to reposition the image</DialogDescription>
          </DialogHeader>
          <div className="relative h-64 w-full overflow-hidden rounded-md bg-black/90">
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
            <Input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
              {zoom.toFixed(1)}×
            </span>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setCropModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyCrop} disabled={avatarUploading}>
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
        </DialogContent>
      </Dialog>

      {/* Profile grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar card */}
        <Card>
          <CardContent className="flex flex-col items-center pt-6 text-center">
            <div className="relative mb-4">
              <div className="h-28 w-28 overflow-hidden rounded-full border bg-muted">
                {avatarPreview || user.avatar ? (
                  <img
                    src={avatarPreview || user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <DefaultAvatar name={user.name} size={112} className="h-full w-full rounded-full" />
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-background"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <Input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={onAvatarFileChange}
                className="hidden"
              />
            </div>
            <h3 className="flex items-center justify-center gap-1.5 text-lg font-semibold">
              {user.name}
              {user.isVerified && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
            </h3>
            <p className="break-all text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">Faculty</Badge>
              {user.isApproved ? (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                  Approved
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                  Pending
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Information card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Update your academic and professional details.</CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
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
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Assistant Professor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collegeName">College Name</Label>
                    <Input
                      id="collegeName"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="Enter your college name"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name);
                      setDepartment(user.department);
                      setCollegeName(user.collegeName);
                      setDesignation(user.designation);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
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
                  <dd className="mt-1 text-sm font-medium">{user.name}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" /> Email
                  </dt>
                  <dd className="mt-1 break-all text-sm font-medium">{user.email}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" /> Designation
                  </dt>
                  <dd className="mt-1 text-sm font-medium">{user.designation || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" /> Department
                  </dt>
                  <dd className="mt-1 text-sm font-medium">{user.department || "Not specified"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" /> College Name
                  </dt>
                  <dd className="mt-1 text-sm font-medium">{user.collegeName || "Not specified"}</dd>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}