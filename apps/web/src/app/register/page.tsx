"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

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
              <Button key={provider} variant="outline" className="h-11 text-sm">
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

          {/* Registration Form */}
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--muted-foreground)]" />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-10 pr-4 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--muted-foreground)]" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-10 pr-4 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--muted-foreground)]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-10 pr-11 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Must be at least 8 characters with a number and special character
              </p>
            </div>

            <Button variant="glow" className="w-full h-11 mt-2 gap-2">
              Create Account
              <ArrowRight className="size-4" />
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
