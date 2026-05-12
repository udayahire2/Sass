import { useEffect, useState } from "react";
import {
    fetchPlatformFeedback,
    updatePlatformFeedbackStatus,
    type PlatformFeedback,
} from "@/services/feedback-service";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Loader2,
    MessageSquare,
} from "lucide-react";

import { toast } from "sonner";

export default function FeedbackManagerPage() {
    const [feedbacks, setFeedbacks] = useState<PlatformFeedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeedbacks();
    }, []);

    const loadFeedbacks = async () => {
        setLoading(true);

        const data = await fetchPlatformFeedback();

        setFeedbacks(data);
        setLoading(false);
    };

    const handleStatusChange = async (
        id: string,
        newStatus: string
    ) => {
        const success = await updatePlatformFeedbackStatus(
            id,
            newStatus as any
        );

        if (success) {
            toast.success("Feedback updated");

            setFeedbacks((prev) =>
                prev.map((feedback) =>
                    feedback.id === id
                        ? {
                            ...feedback,
                            status: newStatus as any,
                        }
                        : feedback
                )
            );
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-neutral-100 text-neutral-700 border-neutral-200";

            case "reviewed":
                return "bg-blue-50 text-blue-700 border-blue-200";

            case "resolved":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";

            default:
                return "bg-neutral-100 text-neutral-700 border-neutral-200";
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case "bug":
                return "bg-red-50 text-red-700 border-red-200";

            case "feature":
                return "bg-purple-50 text-purple-700 border-purple-200";

            case "general":
                return "bg-neutral-100 text-neutral-700 border-neutral-200";

            default:
                return "bg-neutral-100 text-neutral-700 border-neutral-200";
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-6 py-8">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                    Platform Feedback
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                    Review user suggestions, bugs, and platform feedback.
                </p>
            </div>

            {/* Empty State */}
            {feedbacks.length === 0 ? (
                <Card className="border border-dashed border-neutral-200 bg-white shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="mb-5 rounded-full border border-neutral-200 bg-neutral-50 p-4">
                            <MessageSquare className="h-7 w-7 text-neutral-500" />
                        </div>

                        <h2 className="text-lg font-medium text-neutral-900">
                            No feedback available
                        </h2>

                        <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
                            User feedback submissions will automatically appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {feedbacks.map((feedback) => (
                        <Card
                            key={feedback.id}
                            className="
                                group
                                overflow-hidden
                                rounded-2xl
                                border
                                border-neutral-200
                                bg-white
                                shadow-none
                                transition-all
                                duration-200
                                hover:border-neutral-300
                                hover:bg-neutral-50/40
                            "
                        >
                            <CardContent className="p-5">
                                {/* Top Section */}
                                <div className="flex items-start justify-between gap-4">
                                    <div
                                        className={`
                                            inline-flex
                                            items-center
                                            rounded-full
                                            border
                                            px-2.5
                                            py-1
                                            text-xs
                                            font-medium
                                            capitalize
                                            ${getTypeStyles(feedback.type)}
                                        `}
                                    >
                                        {feedback.type}
                                    </div>

                                    <Select
                                        value={feedback.status}
                                        onValueChange={(value) =>
                                            handleStatusChange(
                                                feedback.id,
                                                value ?? ""
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            className={`
                                                h-8
                                                w-[120px]
                                                rounded-lg
                                                border
                                                text-xs
                                                shadow-none
                                                focus:ring-0
                                                ${getStatusStyles(
                                                feedback.status
                                            )}
                                            `}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="pending">
                                                Pending
                                            </SelectItem>

                                            <SelectItem value="reviewed">
                                                Reviewed
                                            </SelectItem>

                                            <SelectItem value="resolved">
                                                Resolved
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* User Info */}
                                <div className="mt-5">
                                    <h2 className="text-base font-semibold text-neutral-900">
                                        {feedback.first_name}{" "}
                                        {feedback.last_name}
                                    </h2>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        {feedback.email}
                                    </p>

                                    <p className="mt-1 text-xs text-neutral-400">
                                        {new Date(
                                            feedback.created_at
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="my-5 h-px bg-neutral-100" />

                                {/* Message */}
                                <div>
                                    <p className="whitespace-pre-wrap text-sm leading-7 text-neutral-700">
                                        {feedback.message}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}