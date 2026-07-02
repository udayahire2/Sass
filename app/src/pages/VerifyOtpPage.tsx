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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Frame } from "@/components/ui/frame"; // 👈 your layout wrapper
import {
  buildApiUrl,
  getErrorMessage,
  parseApiData,
  buildAssetUrl,
} from "@/services/api";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(buildApiUrl("/auth/verify-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      const currentUser =
        parseApiData<Record<string, unknown> | null>(data, null) ?? data.user;

      if (currentUser) {
        if (
          typeof currentUser.avatar === "string" &&
          currentUser.avatar.startsWith("/")
        ) {
          currentUser.avatar = buildAssetUrl(currentUser.avatar);
        } else if (
          typeof currentUser.avatarUrl === "string" &&
          currentUser.avatarUrl.startsWith("/")
        ) {
          currentUser.avatar = buildAssetUrl(currentUser.avatarUrl);
        }
      }

      const token =
        typeof data.token === "string" ? data.token : data.data?.token;

      if (res.ok && data.success && token && currentUser) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(currentUser));
        if (currentUser.role === "admin") {
          window.location.href = "/admin/dashboard";
        } else if (currentUser.role === "faculty") {
          window.location.href = "/dashboard/faculty";
        } else {
          window.location.href = "/";
        }
      } else {
        alert(getErrorMessage(data, "Verification failed"));
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollArea className="">
      <div className="flex h-screen w-full items-center justify-center ">
        <Frame className="w-fit h-f">
          <Card>
            <CardHeader className="space-y-4 pb-5">
              <Badge variant="outline" className="w-fit">
                Account Verification
              </Badge>
              <div className="space-y-2">
                <CardTitle>Verify Your Account</CardTitle>
                <CardDescription>
                  Enter the OTP sent to{" "}
                  <span className="font-medium">{email || "your email"}</span>.
                </CardDescription>
              </div>
            </CardHeader>
            <Separator />
            <form onSubmit={handleVerify}>
              <CardPanel className="space-y-5 pt-6">
                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <KeyRound className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">One final step</p>
                      <p className="text-sm text-muted-foreground">
                        Paste the 6‑digit code from your inbox to finish setup.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="otp">One‑Time Password (OTP)</Label>
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading || otp.length !== 6}
                >
                  Verify OTP
                  <ArrowRight className="size-4" />
                </Button>
              </CardPanel>
            </form>
            <CardFooter className="justify-center pt-1 pb-6">
              <p className="text-sm text-muted-foreground">
                Need a different account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-foreground transition-colors hover:text-primary"
                >
                  Return to sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </Frame>
      </div>
    </ScrollArea>
  );
}
