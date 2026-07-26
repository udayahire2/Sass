"use client";

import { useState, Fragment } from "react";
import { ArrowRight, Loader2, Eye, EyeOff, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { buildApiUrl, getErrorMessage } from "@/services/api";

export const title = "Sign Up";

type UserRole = "student" | "faculty";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branch?: string;
  year?: string;
  designation?: string;
  department?: string;
  collegeName?: string;
  subjects?: string[];
}

const steps = [
  { id: 1, label: "Role" },
  { id: 2, label: "Account" },
  { id: 3, label: "Details" },
];

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState<UserRole>("student");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [branch, setBranch] = useState("Computer");
  const [year, setYear] = useState("SE");

  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [subjects, setSubjects] = useState("");
  const [collegeName, setCollegeName] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    setLoading(true);

    try {
      const payload: RegisterPayload = { name, email, password, role };

      if (role === "student") {
        payload.branch = branch || "Computer";
        payload.year = year || "SE";
      } else {
        payload.designation = designation;
        payload.department = department;
        payload.collegeName = collegeName;
        payload.subjects = subjects.split(",").map((s) => s.trim()).filter(Boolean);
      }

      const res = await fetch(buildApiUrl("/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned invalid response (${res.status} ${res.statusText}). Check VITE_API_URL on Vercel.`);
      }

      if (res.ok && data.success) {
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        alert(getErrorMessage(data, `Registration failed (${res.status})`));
      }
    } catch (error: unknown) {
      console.error("Registration Error:", error);
      alert(`Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-1 font-sans">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-xs text-zinc-500 mt-2">
          Fill the basic details to start using the platform.
        </p>
      </div>

      {/* Stepper UI */}
      <div className="flex items-center w-full mb-10 pt-2 pb-6 px-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <Fragment key={step.id}>
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                    ${
                      isCompleted
                        ? "bg-blue-500 text-white border-2 border-blue-500"
                        : isActive
                        ? "bg-background text-blue-500 border-2 border-blue-500"
                        : "bg-background text-zinc-600 border-2 border-zinc-800"
                    }
                  `}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-3" /> : step.id}
                </div>
                <span
                  className={`text-[11px] mt-2 font-medium absolute top-8 w-max transition-colors duration-300 ${
                    isCompleted || isActive ? "text-foreground" : "text-zinc-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 -mx-1 transition-colors duration-300 z-0 ${
                    isCompleted ? "bg-blue-500" : "bg-zinc-800"
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {/* Step 1: Role Selection */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Role</label>
              <Select onValueChange={(val) => setRole(val as UserRole)} value={role} required>
                <SelectTrigger className="h-9 w-full rounded-lg border border-input bg-background text-foreground shadow-xs/5">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="border-input bg-popover text-foreground">
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Account Details */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Full name</label>
              <Input
                placeholder="Enter your full name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Email</label>
              <Input
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="w-fit">
                Back
              </Button>
              <Button type="submit" className="w-fit">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Profile Details */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {role === "student" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Branch</label>
                  <Select onValueChange={(value) => setBranch(value ?? "")} value={branch} required>
                    <SelectTrigger className="h-9 w-full rounded-lg border border-input bg-background text-foreground shadow-xs/5">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent className="border-input bg-popover text-foreground">
                      <SelectItem value="Computer">Computer</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Civil">Civil</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="ENTC">ENTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Year</label>
                  <Select onValueChange={(value) => setYear(value ?? "")} value={year} required>
                    <SelectTrigger className="h-9 w-full rounded-lg border border-input bg-background text-foreground shadow-xs/5">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent className="border-input bg-popover text-foreground">
                      <SelectItem value="FE">FE</SelectItem>
                      <SelectItem value="SE">SE</SelectItem>
                      <SelectItem value="TE">TE</SelectItem>
                      <SelectItem value="BE">BE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {role === "faculty" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Designation</label>
                  <Input
                    placeholder="Assistant Professor"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Department</label>
                  <Input
                    placeholder="Computer Engineering"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">College</label>
                  <Input
                    placeholder="College name"
                    required
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Subjects</label>
                  <Input
                    placeholder="DBMS, OS, TOC (Comma separated)"
                    required
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}  disabled={loading}>
                Back
              </Button>
              <Button type="submit"  disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create account
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Footer */}
      <div className="mt-6 text-center space-y-4">
        <p className="text-xs text-zinc-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-foreground/80 font-medium hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;