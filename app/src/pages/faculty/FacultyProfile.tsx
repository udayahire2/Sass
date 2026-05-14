import { useState, useEffect, useRef, useCallback } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DefaultAvatar } from "@/components/ui/DefaultAvatar";
import { Badge } from "@/components/ui/badge";
import {
  Edit2,
  Save,
  X,
  User,
  Mail,
  ShieldCheck,
  Loader2,
  Camera,
  ZoomIn,
  CheckCircle2,
  ImagePlus,
  Briefcase,
  Building
} from "lucide-react";
import { toast } from "sonner";
import { buildApiUrl, buildAvatarUrl, getErrorMessage, parseApiData } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Same cropping utils
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
      if (parsedUser.avatar) {
        setAvatarPreview(parsedUser.avatar);
      }
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

      if (!token) {
        toast.error("You must be signed in to update your avatar.");
        setCropModalOpen(false);
        return;
      }

      const formData = new FormData();
      formData.append("avatar", new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" }));

      const res = await fetch(buildApiUrl("/auth/updateavatar"), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || `Upload failed (${res.status})`);
        return;
      }

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

      const resolvedUrl = rawAvatarPath.startsWith("http")
        ? rawAvatarPath
        : buildAvatarUrl(rawAvatarPath);

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

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faculty Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and academic credentials.
        </p>
      </div>

      {cropModalOpen && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-popover/95 shadow-2xl backdrop-blur-xl">
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

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6">
          <Card className="border-border/70 shadow-sm">
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
              
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  Faculty
                </Badge>
                {user.isApproved ? (
                   <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                     Approved Status
                   </Badge>
                ) : (
                   <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                     Pending Approval
                   </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
              <div>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>Update your academic and professional details.</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="mr-2 h-4 w-4" /> Edit Details
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
                  <div className="flex justify-end gap-2 border-t border-border/40 pt-4 mt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user.name || "");
                        setDepartment(user.department || "");
                        setCollegeName(user.collegeName || "");
                        setDesignation(user.designation || "");
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
                    <dd className="text-sm font-semibold mt-1">{user.name}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email Address
                    </dt>
                    <dd className="text-sm font-semibold mt-1 break-all">{user.email}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> Designation
                    </dt>
                    <dd className="text-sm font-semibold mt-1">{user.designation || "Not specified"}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Building className="h-4 w-4" /> Department
                    </dt>
                    <dd className="text-sm font-semibold mt-1">{user.department || "Not specified"}</dd>
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Building className="h-4 w-4" /> College Name
                    </dt>
                    <dd className="text-sm font-semibold mt-1">{user.collegeName || "Not specified"}</dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
