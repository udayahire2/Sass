import { useState } from "react";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { submitPlatformFeedback } from "@/services/feedback-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";

export default function FeedbackPage() {
    const { user } = useLocalAuth();
    const [type, setType] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    if (!user) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <p className="text-muted-foreground">Please log in to submit feedback.</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!type || !message.trim()) {
            toast.error("Please select a feedback type and provide a message.");
            return;
        }

        setLoading(true);
        const success = await submitPlatformFeedback({ type, message });
        setLoading(false);

        if (success) {
            toast.success("Feedback submitted successfully. Thank you!");
            setType("");
            setMessage("");
        }
    };

    return (
        <div className="mx-auto max-w-2xl py-12 px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg border-border/40">
                <CardHeader>
                    <CardTitle className="text-2xl">Platform Feedback</CardTitle>
                    <CardDescription>
                        We value your input! Let us know how we can improve your experience, report any bugs, or suggest new features.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="type">Feedback Type</Label>
                            <Select value={type} onValueChange={setType} required>
                                <SelectTrigger id="type" className="w-full">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bug">Report a Bug</SelectItem>
                                    <SelectItem value="feature">Feature Request</SelectItem>
                                    <SelectItem value="general">General Feedback</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                placeholder="Tell us more about your feedback..."
                                className="min-h-[150px] resize-y"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" /> Submit Feedback
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
