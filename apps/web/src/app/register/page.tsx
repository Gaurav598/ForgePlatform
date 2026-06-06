"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth-store";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success("Account created!", { description: "Welcome to FORGE AI." });
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      toast.error("Registration failed", { description: message });
    }
  };

  return (
    <div className="min-h-dvh flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[var(--primary)]/[0.03]">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="relative flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          >
            <Link href="/" className="flex items-center gap-2.5 mb-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] shadow-md">
                <Sparkles className="size-5 text-[var(--primary-foreground)]" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                FORGE<span className="text-gradient"> AI</span>
              </span>
            </Link>
            <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
              Start forging your
              <br />
              <span className="text-gradient">AI-powered career</span>
            </h1>
            <p className="text-[var(--muted-foreground)] text-lg leading-relaxed max-w-md">
              Create an account and unlock presentations, resume tools, interview prep, and more.
            </p>

            {/* Feature highlights */}
            <div className="mt-8 space-y-3">
              {["AI Presentations & Content", "Resume Analysis & Builder", "Interview Preparation", "Career Copilot"].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)]/10">
                    <Sparkles className="size-3 text-[var(--primary)]" />
                  </div>
                  <span className="text-[var(--muted-foreground)]">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]">
                <Sparkles className="size-4 text-[var(--primary-foreground)]" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                FORGE<span className="text-gradient"> AI</span>
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Create your account</h2>
            <p className="text-[var(--muted-foreground)]">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--primary)] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {["Google", "GitHub", "LinkedIn"].map((provider) => (
              <Button
                key={provider}
                variant="outline"
                className="h-11 text-sm"
                type="button"
                onClick={() => toast.info(`${provider} OAuth coming soon`)}
              >
                {provider}
              </Button>
            ))}
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[var(--background)] px-3 text-[var(--muted-foreground)]">
                or sign up with email
              </span>
            </div>
          </div>

          {/* Global error banner */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 text-sm text-[var(--destructive)]">
              <AlertCircle className="size-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--muted-foreground)]" />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  {...register("name")}
                  className={`flex h-11 w-full rounded-xl border bg-[var(--background)] pl-10 pr-4 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all ${errors.name ? "border-[var(--destructive)]" : "border-[var(--border)]"
                    }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-[var(--destructive)] flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--muted-foreground)]" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register("email")}
                  className={`flex h-11 w-full rounded-xl border bg-[var(--background)] pl-10 pr-4 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all ${errors.email ? "border-[var(--destructive)]" : "border-[var(--border)]"
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-[var(--destructive)] flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--muted-foreground)]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register("password")}
                  className={`flex h-11 w-full rounded-xl border bg-[var(--background)] pl-10 pr-11 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all ${errors.password ? "border-[var(--destructive)]" : "border-[var(--border)]"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-[var(--destructive)] flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3" />
                  {errors.password.message}
                </p>
              ) : (
                <p className="text-xs text-[var(--muted-foreground)]">
                  Must be at least 8 characters with a number and special character
                </p>
              )}
            </div>

            <Button
              variant="glow"
              className="w-full h-11 mt-2 gap-2"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
            By creating an account, you agree to our{" "}
            <Link href="#" className="underline hover:text-[var(--foreground)]">Terms</Link>{" "}
            and{" "}
            <Link href="#" className="underline hover:text-[var(--foreground)]">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
