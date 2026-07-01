import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardPanel,
    CardFooter,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    OTPField,
    OTPFieldInput,
    OTPFieldSeparator,
} from "@/components/ui/otp-field";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AuthShell } from "@/components/auth/auth-shell";
import { buildApiUrl, getErrorMessage, parseApiData, buildAssetUrl } from "@/services/api";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function VerifyOtpPage() {
    const [searchParams] = useSearchParams();
    // const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(buildApiUrl('/auth/verify-otp'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();
            const currentUser = parseApiData<Record<string, unknown> | null>(data, null) ?? data.user;
            
            if (currentUser) {
                if (typeof currentUser.avatar === 'string' && currentUser.avatar.startsWith('/')) {
                    currentUser.avatar = buildAssetUrl(currentUser.avatar);
                } else if (typeof currentUser.avatarUrl === 'string' && currentUser.avatarUrl.startsWith('/')) {
                    currentUser.avatar = buildAssetUrl(currentUser.avatarUrl);
                }
            }

            const token = typeof data.token === 'string' ? data.token : data.data?.token;

            if (res.ok && data.success && token && currentUser) {
                // Store token
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(currentUser));
                // Reload or redirect to trigger auth state update
                // Redirect based on role
                if (currentUser.role === 'admin') {
                    window.location.href = '/admin/dashboard';
                } else if (currentUser.role === 'faculty') {
                    window.location.href = '/dashboard/faculty';
                } else {
                    window.location.href = '/';
                }
            } else {
                alert(getErrorMessage(data, 'Verification failed'));
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollArea className="h-screen w-screen">
            <AuthShell
                badge="Verification"
                title="Confirm your account before you enter the workspace."
                description="Use the one-time password sent to your email so the platform can activate the right access level for your account."
                highlights={[
                    "Verification links your role and access permissions correctly.",
                    "OTP confirmation keeps protected materials and dashboards secure.",
                    "You will be redirected automatically after a successful verification.",
                    "If needed, you can return and sign in again with the same email."
                ]}
            >
                <Card className="w-full rounded-3xl border-border/60 bg-card/95 shadow-xl shadow-black/5 backdrop-blur-xl">
                    <CardHeader className="space-y-4 pb-5">
                        <Badge variant="outline" className="w-fit rounded-full border-border/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Account Verification
                        </Badge>
                        <div className="space-y-2">
                            <CardTitle className="text-2xl">Verify Your Account</CardTitle>
                            <CardDescription className="text-sm leading-6">
                                Enter the OTP sent to <span className="font-medium text-foreground">{email || "your email"}</span>.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <Separator className="bg-border/60" />
                    <form onSubmit={handleVerify}>
                        <CardPanel className="space-y-5 pt-6">
                            <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                        <KeyRound className="size-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">One final step</p>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            Paste the 6-digit code from your inbox to finish setup.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Label htmlFor="otp">One-Time Password (OTP)</Label>
                                <OTPField
                                    length={6}
                                    value={otp}
                                    onValueChange={setOtp}
                                >
                                    <OTPFieldInput aria-label="Character 1 of 6" />
                                    <OTPFieldInput aria-label="Character 2 of 6" />
                                    <OTPFieldInput aria-label="Character 3 of 6" />
                                    <OTPFieldSeparator />
                                    <OTPFieldInput aria-label="Character 4 of 6" />
                                    <OTPFieldInput aria-label="Character 5 of 6" />
                                    <OTPFieldInput aria-label="Character 6 of 6" />
                                </OTPField>
                            </div>

                            <Button className="h-11 w-full rounded-xl" type="submit" loading={loading} disabled={loading || otp.length !== 6}>
                                Verify OTP
                                <ArrowRight className="size-4" />
                            </Button>
                        </CardPanel>
                    </form>
                    <CardFooter className="justify-center pt-1 pb-6">
                        <p className="text-sm text-muted-foreground">
                            Need a different account?{" "}
                            <Link to="/login" className="font-medium text-foreground transition-colors hover:text-primary">
                                Return to sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </AuthShell>
        </ScrollArea>
    );
}
