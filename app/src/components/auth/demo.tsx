"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";

// COSS UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  buildApiUrl,
  getErrorMessage,
  parseApiData,
  buildAssetUrl,
} from "@/services/api";
import { Logo } from "../ui/logo";

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

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
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
    <div className="w-full max-w-sm mx-auto flex flex-col items-center text-white font-sans">
      {/* Brand Logo Placeholder - Matched to Image */}
      <div className="mb-10 flex items-center gap-3 text-2xl font-bold tracking-tighter">
       <Logo/>
      </div>

      <h1 className="text-xl font-semibold mb-6 tracking-tight text-zinc-100">
        Login OR Create Account
      </h1>

      {/* Social Logins */}
      <div className="w-full flex flex-col gap-2.5 mb-8">
        <Button
          type="button"
          variant="outline"
        >
          <span className="mr-2 text-base font-bold flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 16 16"
            >
              <path d="M0 0h16v16H0z" fill="none" />
              {/* REPAIRED: fill-rule and clip-rule changed to camelCase */}
              <g fill="none" fillRule="evenodd" clipRule="evenodd">
                <path
                  fill="#f44336"
                  d="M7.209 1.061c.725-.081 1.154-.081 1.933 0a6.57 6.57 0 0 1 3.65 1.82a100 100 0 0 0-1.986 1.93q-1.876-1.59-4.188-.734q-1.696.78-2.362 2.528a78 78 0 0 1-2.148-1.658a.26.26 0 0 0-.16-.027q1.683-3.245 5.26-3.86"
                  opacity=".987"
                />
                <path
                  fill="#ffc107"
                  d="M1.946 4.92q.085-.013.161.027a78 78 0 0 0 2.148 1.658A7.6 7.6 0 0 0 4.04 7.99q.037.678.215 1.331L2 11.116Q.527 8.038 1.946 4.92"
                  opacity=".997"
                />
                <path
                  fill="#448aff"
                  d="M12.685 13.29a26 26 0 0 0-2.202-1.74q1.15-.812 1.396-2.228H8.122V6.713q3.25-.027 6.497.055q.616 3.345-1.423 6.032a7 7 0 0 1-.51.49"
                  opacity=".999"
                />
                <path
                  fill="#43a047"
                  d="M4.255 9.322q1.23 3.057 4.51 2.854a3.94 3.94 0 0 0 1.718-.626q1.148.812 2.202 1.74a6.62 6.62 0 0 1-4.027 1.684a6.4 6.4 0 0 1-1.02 0Q3.82 14.524 2 11.116z"
                  opacity=".993"
                />
              </g>
            </svg>
          </span>
          Continue with Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full h-10 bg-transparent border-zinc-800 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all rounded-lg flex items-center justify-center"
        >
          <span className="mr-2 text-base font-bold flex items-center">
          {/* REPAIRED: Added mr-2 to space the icon away from the text */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.2em"
            height="1.2em"
            viewBox="0 0 24 24"
            className="mr-2"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              fill="currentColor"
              d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
            />
          </svg>
          </span>
          Continue with GitHub
        </Button>
      </div>

      {/* Divider */}
      <div className="w-full flex items-center gap-3 mb-8">
        <div className="flex-1 h-[1px] bg-zinc-800/80"></div>
        <span className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase">
          OR
        </span>
        <div className="flex-1 h-[1px] bg-zinc-800/80"></div>
      </div>

      {/* Email/Password Form (Fields Kept Intact) */}
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="name@example.com"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        disabled={loading}
                        className="pr-10"
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
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs mt-1" />
                </FormItem>
              )}
            />

            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-900/10 px-3 py-2 text-xs text-red-400 text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              variant="outline"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue with Email"
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Footer / Privacy Policy */}
      <div className="mt-8 text-center space-y-4">
        <p className="text-xs text-zinc-500">
          New to NMU StudyHub?{" "}
          <Link
            to="/signup"
            className="text-zinc-300 font-medium hover:text-white transition-colors"
          >
            Create an account
          </Link>
        </p>
        
        <p className="text-[10px] text-zinc-600 tracking-wide max-w-[280px] mx-auto leading-relaxed">
          By continuing, you agree to NMU StudyHub's{" "}
          <a href="#" className="underline hover:text-zinc-500 transition-colors">Terms of Service</a> and{" "}
          <a href="#" className="underline hover:text-zinc-500 transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default Login;
