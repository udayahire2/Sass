import { useState, useEffect, useRef, useCallback } from "react";
import type { FormEvent, ChangeEvent } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import {
  Camera,
  ZoomIn,
  Edit2,
  Save,
  Mail,
  BookOpen,
  CalendarDays,
  Clock,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardPanel,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import { DefaultAvatar } from "@/components/ui/DefaultAvatar";
import {
  buildApiUrl,
  buildAvatarUrl,
  getErrorMessage,
  parseApiData,
} from "@/services/api";
import { DefaultAvatar } from "@/components/ui/DefaultAvatar";

// ------------------------------------------------------------
// Cropping utilities
// ------------------------------------------------------------
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputSize = 400,
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
    outputSize,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas is empty"));
      },
      "image/jpeg",
      0.92,
    );
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

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, branch, year }),
      });
      const data = await res.json();
      const updatedPayload =
        parseApiData<Partial<LocalProfileUser> | null>(data, null) ?? data.user;
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
    if (!selectedFile.type.startsWith("image/"))
      return toast.error("Please select a valid image.");
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

  const onCropComplete = useCallback(
    (_: Area, croppedPixels: Area) => setCroppedAreaPixels(croppedPixels),
    [],
  );

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setAvatarUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!token) throw new Error("Authentication missing.");
      const formData = new FormData();
      formData.append(
        "avatar",
        new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" }),
      );
      const res = await fetch(buildApiUrl("/auth/updateavatar"), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload rejected.");
      const rawAvatarPath =
        data?.avatar_url || data?.data?.avatar || data?.data?.avatarUrl || "";
      if (!rawAvatarPath) throw new Error("No URL provided by server.");
      const resolvedUrl = rawAvatarPath.startsWith("http")
        ? rawAvatarPath
        : buildAvatarUrl(rawAvatarPath);
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
    <div className="mx-auto max-w-4xl space-y-8">
      {" "}
      {/* Profile Header */}{" "}
      <Card>
        {" "}
        <CardPanel className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          {" "}
          <div
            className="relative cursor-pointer"
            onClick={() => avatarInputRef.current?.click()}
          >
            {" "}
            <div className="h-24 w-24 overflow-hidden rounded-full border bg-muted">
              {" "}
              {avatarPreview || user?.avatar ? (
                <img
                  src={avatarPreview || user?.avatar || undefined}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <DefaultAvatar
                  name={user?.name || "User"}
                  size={96}
                  className="h-full w-full"
                />
              )}{" "}
            </div>{" "}
            <Input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={onAvatarFileChange}
              className="hidden"
            />{" "}
          </div>{" "}
          <div className="space-y-1">
            {" "}
            <h1 className="text-2xl font-semibold">
              {" "}
              {user?.name || "Student"}{" "}
            </h1>{" "}
            <p className="text-sm text-muted-foreground"> {user?.email} </p>{" "}
            <Badge variant="secondary"> Student Account </Badge>{" "}
          </div>{" "}
        </CardPanel>{" "}
      </Card>{" "}
      {/* Personal Information */}{" "}
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <CardTitle>Personal Information</CardTitle>{" "}
          <CardDescription>
            {" "}
            Update your academic profile details.{" "}
          </CardDescription>{" "}
        </CardHeader>{" "}
        <CardPanel>
          {" "}
          <form onSubmit={handleUpdate} className="space-y-6">
            {" "}
            <div className="grid gap-5 md:grid-cols-3">
              {" "}
              <Field>
                {" "}
                <FieldLabel htmlFor="name"> Full Name </FieldLabel>{" "}
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />{" "}
              </Field>{" "}
              <Field>
              {" "}
                <FieldLabel> Branch </FieldLabel>{" "}
                <Select value={branch} onValueChange={(val) => setBranch(val || "")}>
                  {" "}
                  <SelectTrigger>
                    {" "}
                    <SelectValue placeholder="Select branch" />{" "}
                  </SelectTrigger>{" "}
                  <SelectContent>
                    {" "}
                    {[
                      "Computer",
                      "IT",
                      "Civil",
                      "Mechanical",
                      "Electrical",
                      "ENTC",
                    ].map((item) => (
                      <SelectItem key={item} value={item}>
                        {" "}
                        {item} Engineering{" "}
                      </SelectItem>
                    ))}{" "}
                  </SelectContent>{" "}
                </Select>{" "}
              </Field>{" "}
              <Field>
                {" "}
                <FieldLabel> Academic Year </FieldLabel>{" "}
                <Select value={year} onValueChange={(val) => setYear(val || "")}>
                  {" "}
                  <SelectTrigger>
                    {" "}
                    <SelectValue placeholder="Select year" />{" "}
                  </SelectTrigger>{" "}
                  <SelectContent>
                    {" "}
                    {["FE", "SE", "TE", "BE"].map((item) => (
                      <SelectItem key={item} value={item}>
                        {" "}
                        {item}{" "}
                      </SelectItem>
                    ))}{" "}
                  </SelectContent>{" "}
                </Select>{" "}
              </Field>{" "}
            </div>{" "}
            <div className="flex justify-end">
              {" "}
              <Button type="submit" disabled={loading}>
                {" "}
                {loading ? "Saving..." : "Save Changes"}{" "}
              </Button>{" "}
            </div>{" "}
          </form>{" "}
        </CardPanel>{" "}
      </Card>{" "}
      {/* Account Information */}{" "}
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <CardTitle> Account Information </CardTitle>{" "}
        </CardHeader>{" "}
        <CardPanel>
          {" "}
          <div className="divide-y">
            {" "}
            <div className="flex items-center justify-between py-4">
              {" "}
              <span className="text-muted-foreground"> Email </span>{" "}
              <span className="font-medium"> {user?.email} </span>{" "}
            </div>{" "}
            <div className="flex items-center justify-between py-4">
              {" "}
              <span className="text-muted-foreground"> Account Type </span>{" "}
              <Badge variant="outline"> Student </Badge>{" "}
            </div>{" "}
            <div className="flex items-center justify-between py-4">
              {" "}
              <span className="text-muted-foreground"> Member Since </span>{" "}
              <span className="font-medium">
                {" "}
                {formatDate(user?.createdAt)}{" "}
              </span>{" "}
            </div>{" "}
            <div className="flex items-center justify-between py-4">
              {" "}
              <span className="text-muted-foreground"> Verification </span>{" "}
              <Badge variant={user?.isVerified ? "default" : "secondary"}>
                {" "}
                {user?.isVerified ? "Verified" : "Pending"}{" "}
              </Badge>{" "}
            </div>{" "}
          </div>{" "}
        </CardPanel>{" "}
      </Card>{" "}
    </div>
  );
}
