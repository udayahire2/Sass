"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import Github from "@/svgs/github";
import Google from "@/svgs/google";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { Spinner } from "../ui/spinner";
import { Separator } from "../ui/separator";

import {
  buildApiUrl,
  getErrorMessage,
  parseApiData,
  buildAssetUrl,
} from "@/services/api";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginForm) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
          navigate("/admin/dashboard");
        } else if (currentUser.role === "faculty") {
          navigate("/dashboard/faculty");
        } else {
          navigate("/");
        }
      } else {
        setError(getErrorMessage(data, "Login failed"));
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto gap-1 font-sans">
      {/* Hide browser's native password reveal button */}
      <style>{`
        .hide-native-pw-reveal[type="password"]::-webkit-reveal-button,
        .hide-native-pw-reveal[type="password"]::-webkit-credentials-auto-fill-button,
        .hide-native-pw-reveal[type="password"]::-webkit-clear-button {
          display: none !important;
        }
        .hide-native-pw-reveal[type="password"] {
          -moz-appearance: textfield;
        }
      `}</style>

      <h1 className="text-2xl font-medium mb-6 tracking-tight text-foreground">
        Login with NMU STUDY HUB
      </h1>

      {/* Social Logins */}
      <div className="w-full flex flex-col gap-3.5">
        <Button variant="outline" className="w-full flex gap-2">
          <Google />
          Continue with Google
        </Button>

        <Button variant="outline" className="w-full flex gap-2">
          <Github />
          Continue with GitHub
        </Button>
      </div>

      <Separator className="my-2" />

      {/* Email/Password Form */}
      <div className="w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Input
              type="email"
              placeholder="name@example.com"
              disabled={loading}
              {...register("email")}
              className={`w-full ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                disabled={loading}
                {...register("password")}
                className={`w-full pr-10 hide-native-pw-reveal ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <Alert variant="warning">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
            Continue with Email
          </Button>
        </form>
      </div>

      <div className="my-2 text-center space-y-4">
        <p className="text-xs text-zinc-500">
          New to NMU StudyHub?{" "}
          <Link
            to="/signup"
            className="text-zinc-300 font-medium hover:text-white transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;