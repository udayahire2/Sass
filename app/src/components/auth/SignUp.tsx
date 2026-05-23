"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
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
import { Logo } from "../ui/logo";

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

// Reusable styling for inputs and select triggers to match the dark VIP aesthetic
const inputClasses = "h-10 bg-[#0a0a0a] border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:ring-offset-0 rounded-lg shadow-none";
const labelClasses = "text-xs font-medium text-zinc-400 mb-1.5 block";

const SignUp = () => {
  const [role, setRole] = useState<UserRole>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");

  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [subjects, setSubjects] = useState("");
  const [collegeName, setCollegeName] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: RegisterPayload = { name, email, password, role };

      if (role === "student") {
        payload.branch = branch;
        payload.year = year;
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

      const data = await res.json();

      if (data.success) {
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        alert(getErrorMessage(data, "Registration failed"));
      }
    } catch (error: unknown) {
      console.error("Registration Error:", error);
      alert(`Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col text-white font-sans">
      
      {/* Brand Logo Placeholder - Matched to Login */}
      <div className="mb-8 flex items-center justify-center gap-3 text-2xl font-bold tracking-tighter">
      <Logo/>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Create your account
        </h1>
        <p className="text-xs text-zinc-500 mt-2">
          Fill the basic details to start using the platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Role Selection */}
        <div>
          <label className={labelClasses}>Role</label>
          <Select onValueChange={(val) => setRole(val as UserRole)} value={role} required>
            <SelectTrigger id="role" className={inputClasses}>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-[#111111] border-zinc-800 text-white">
              <SelectItem value="student" className="focus:bg-zinc-800 focus:text-white">Student</SelectItem>
              <SelectItem value="faculty" className="focus:bg-zinc-800 focus:text-white">Faculty</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Common Fields */}
        <div>
          <label className={labelClasses}>Full name</label>
          <Input
            id="name"
            placeholder="jitu pardhi"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Email</label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Password</label>
          <Input
            id="password"
            type="password"
            placeholder="Create a secure password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Student Specific Fields */}
        {role === "student" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClasses}>Branch</label>
              <Select onValueChange={(val) => val && setBranch(val)} value={branch} required>
                <SelectTrigger id="branch" className={inputClasses}>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-zinc-800 text-white">
                  <SelectItem value="Computer" className="focus:bg-zinc-800 focus:text-white">Computer</SelectItem>
                  <SelectItem value="IT" className="focus:bg-zinc-800 focus:text-white">IT</SelectItem>
                  <SelectItem value="Civil" className="focus:bg-zinc-800 focus:text-white">Civil</SelectItem>
                  <SelectItem value="Mechanical" className="focus:bg-zinc-800 focus:text-white">Mechanical</SelectItem>
                  <SelectItem value="Electrical" className="focus:bg-zinc-800 focus:text-white">Electrical</SelectItem>
                  <SelectItem value="ENTC" className="focus:bg-zinc-800 focus:text-white">ENTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={labelClasses}>Year</label>
              <Select onValueChange={(val) => val && setYear(val)} value={year} required>
                <SelectTrigger id="year" className={inputClasses}>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-zinc-800 text-white">
                  <SelectItem value="FE" className="focus:bg-zinc-800 focus:text-white">FE</SelectItem>
                  <SelectItem value="SE" className="focus:bg-zinc-800 focus:text-white">SE</SelectItem>
                  <SelectItem value="TE" className="focus:bg-zinc-800 focus:text-white">TE</SelectItem>
                  <SelectItem value="BE" className="focus:bg-zinc-800 focus:text-white">BE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Faculty Specific Fields */}
        {role === "faculty" && (
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>Designation</label>
              <Input
                id="designation"
                placeholder="Assistant Professor"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Department</label>
              <Input
                id="department"
                placeholder="Computer Engineering"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>College</label>
              <Input
                id="collegeName"
                placeholder="College name"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Subjects</label>
              <Input
                id="subjects"
                placeholder="DBMS, OS, TOC (Comma separated)"
                required
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-10 mt-4 w-full bg-[#ededed] text-black hover:bg-white transition-all text-sm font-semibold rounded-lg shadow-none"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-zinc-500">
        Already have an account?{" "}
        <Link to="/login" className="text-zinc-300 font-medium hover:text-white transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUp;