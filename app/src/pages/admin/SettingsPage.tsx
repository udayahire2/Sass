import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Lock, User, Mail, Shield, Save } from "lucide-react";
import { toast } from "sonner";
import { fetchProfile, updateProfile, type AdminProfile } from "@/services/admin-service";

export default function SettingsPage() {
    const [profile, setProfile] = useState<AdminProfile>({
        firstName: "",
        lastName: "",
        email: "",
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            const data = await fetchProfile();
            if (data) {
                setProfile(data);
            }
            setLoading(false);
        };
        loadProfile();
    }, []);

    const handleSave = async () => {
        const updated = await updateProfile(profile);
        if (updated) {
            setProfile(updated);
            toast.success("Profile updated successfully!");
        } else {
            toast.error("Failed to update profile.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProfile((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    // Mock handlers for other sections
    const handlePasswordUpdate = () => {
        toast.info("Password update feature coming soon");
    };

    const handleNotificationToggle = (type: string, current: boolean) => {
        toast.info(`${type} notifications ${current ? "disabled" : "enabled"}`);
    };

    const handleMaintenanceToggle = () => {
        toast.info("Maintenance mode feature coming soon");
    };

    const handleDeleteAllData = () => {
        if (confirm("Are you sure? This action cannot be undone.")) {
            toast.error("This action is not available in demo mode");
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Main column (profile + security) */}
                <div className="md:col-span-2 space-y-8">
                    {/* Profile Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Profile Information</CardTitle>
                            </div>
                            <CardDescription>Update your photo and personal details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <Avatar className="h-24 w-24 border">
                                    <AvatarImage src={profile.avatarUrl || "https://github.com/shadcn.png"} />
                                    <AvatarFallback>
                                        {profile.firstName?.charAt(0)}
                                        {profile.lastName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2 text-center sm:text-left">
                                    <h3 className="font-medium">
                                        {profile.firstName || "Admin"} {profile.lastName || "User"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">Administrator</p>
                                    <div className="flex gap-2 justify-center sm:justify-start">
                                        <Button variant="outline" size="sm">
                                            Change Photo
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive">
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First name</Label>
                                    <Input
                                        id="firstName"
                                        value={loading ? "..." : profile.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last name</Label>
                                    <Input
                                        id="lastName"
                                        value={loading ? "..." : profile.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={loading ? "..." : profile.email}
                                        onChange={handleChange}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={handleSave}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Security</CardTitle>
                            </div>
                            <CardDescription>Manage your password and account security.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input id="confirm-password" type="password" />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button variant="outline" onClick={handlePasswordUpdate}>
                                    Update Password
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar column */}
                <div className="space-y-8">
                    {/* Notifications */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Notifications</CardTitle>
                            </div>
                            <CardDescription>Configure how you receive alerts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <NotificationItem
                                label="Email Alerts"
                                description="Receive daily summaries."
                                enabled={true}
                                onToggle={() => handleNotificationToggle("Email Alerts", true)}
                            />
                            <NotificationItem
                                label="New Signups"
                                description="Notify when students join."
                                enabled={true}
                                onToggle={() => handleNotificationToggle("New Signups", true)}
                            />
                            <NotificationItem
                                label="Pending Approvals"
                                description="Alert for new content."
                                enabled={true}
                                onToggle={() => handleNotificationToggle("Pending Approvals", true)}
                            />
                            <NotificationItem
                                label="Marketing"
                                description="Receive product updates."
                                enabled={false}
                                onToggle={() => handleNotificationToggle("Marketing", false)}
                            />
                        </CardContent>
                    </Card>

                    {/* System */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>System</CardTitle>
                            </div>
                            <CardDescription>Platform preferences and advanced actions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="text-sm font-medium">Maintenance Mode</div>
                                    <div className="text-xs text-muted-foreground">
                                        Disable student access.
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleMaintenanceToggle}>
                                    Off
                                </Button>
                            </div>
                            <div className="pt-4">
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={handleDeleteAllData}
                                >
                                    Delete All Data
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Helper component for notification items
function NotificationItem({
    label,
    description,
    enabled,
    onToggle,
}: {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="space-y-0.5">
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
            </div>
            <Button
                size="sm"
                variant={enabled ? "default" : "outline"}
                onClick={onToggle}
            >
                {enabled ? "Enabled" : "Disabled"}
            </Button>
        </div>
    );
}