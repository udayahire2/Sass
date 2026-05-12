import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UploadCloud, Users, HelpCircle } from "lucide-react";

export default function HowToUsePage() {
    return (
        <div className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">How to Use NMU Study Hub</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    A quick guide to making the most of your academic resources and platform features.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
                    <CardHeader>
                        <Search className="h-8 w-8 text-violet-500 mb-2" />
                        <CardTitle>Finding Study Materials</CardTitle>
                        <CardDescription>Browse or search for syllabus and resources.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>1. Navigate to <strong>Study Material</strong> from the top navigation bar.</p>
                        <p>2. Select your branch, semester, and subject.</p>
                        <p>3. Use the global search (Ctrl + K) to quickly find topics across the platform.</p>
                        <p>4. Save important files by bookmarking them to your profile.</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
                    <CardHeader>
                        <UploadCloud className="h-8 w-8 text-emerald-500 mb-2" />
                        <CardTitle>Contributing Content</CardTitle>
                        <CardDescription>Upload your own notes and resources.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>1. Go to your <strong>Profile Dashboard</strong>.</p>
                        <p>2. Click on the <strong>Add Content</strong> tab.</p>
                        <p>3. Fill in the details (title, subject, document type) and upload your file.</p>
                        <p>4. Your upload will be reviewed by an administrator before becoming public.</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
                    <CardHeader>
                        <Users className="h-8 w-8 text-blue-500 mb-2" />
                        <CardTitle>Faculty Workflows</CardTitle>
                        <CardDescription>Tools specific for faculty members.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>1. Faculty members have a dedicated dashboard to track their contributions.</p>
                        <p>2. Uploaded materials by faculty are fast-tracked for approval.</p>
                        <p>3. Manage your subjects and view student engagement with your content.</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
                    <CardHeader>
                        <HelpCircle className="h-8 w-8 text-amber-500 mb-2" />
                        <CardTitle>Need More Help?</CardTitle>
                        <CardDescription>Reach out to the administration.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>If you encounter a bug, need a new feature, or have general feedback, please use the <strong>Feedback</strong> page.</p>
                        <p>We actively review all submissions to improve the platform experience.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
