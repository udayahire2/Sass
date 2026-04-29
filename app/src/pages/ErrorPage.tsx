import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, FileQuestion, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function ErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();

    let title = "Something went wrong";
    let message = "An unexpected error occurred while loading this page.";
    let Icon = AlertTriangle;

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            title = "Page Not Found";
            message = "We couldn't find the page you're looking for. It might have been moved or doesn't exist.";
            Icon = FileQuestion;
        } else if (error.status === 401) {
            title = "Unauthorized";
            message = "You don't have permission to access this page. Please log in first.";
        } else if (error.status === 503) {
            title = "Service Unavailable";
            message = "Our servers are currently overwhelmed. Please try again later.";
        }
    } else if (error instanceof Error) {
        message = error.message;
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20 -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-20 -z-10 animate-pulse delay-1000" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full text-center space-y-8 relative z-10"
            >
                {/* Icon Container with Glass Effect */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mx-auto w-24 h-24 rounded-3xl bg-background/30 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl relative group"
                >
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Icon className="h-10 w-10 text-primary relative z-10" />
                </motion.div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
                        {title}
                    </h1>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button
                        size="lg"
                        variant="default"
                        onClick={() => navigate("/")}
                        className="w-full sm:w-auto min-w-[140px] gap-2 shadow-lg shadow-primary/20"
                    >
                        <Home className="h-4 w-4" />
                        Go Home
                    </Button>
                    <Button
                        size="lg"
                        variant="secondary"
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto min-w-[140px] gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>
                </div>

                {import.meta.env.DEV && error instanceof Error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-left overflow-hidden"
                    >
                        <p className="font-mono text-xs text-destructive break-all">
                            {error.stack}
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
