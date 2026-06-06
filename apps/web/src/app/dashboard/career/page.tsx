"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain, TrendingUp, BookOpen, Target, GraduationCap, DollarSign,
  Sparkles, Map, Loader2, RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const copilotFeatures = [
  { icon: Map, label: "Career Roadmap", desc: "AI-generated step-by-step path to your dream role", gradient: "from-purple-500/10 to-blue-500/10" },
  { icon: BookOpen, label: "Learning Paths", desc: "Curated courses and resources for skill development", gradient: "from-cyan-500/10 to-teal-500/10" },
  { icon: DollarSign, label: "Salary Insights", desc: "Market salary data based on role, location, and experience", gradient: "from-emerald-500/10 to-green-500/10" },
  { icon: TrendingUp, label: "Growth Tracker", desc: "Track your progress against career milestones", gradient: "from-amber-500/10 to-yellow-500/10" },
  { icon: Target, label: "Skill Gap Analysis", desc: "Identify missing skills for your target role", gradient: "from-orange-500/10 to-red-500/10" },
  { icon: GraduationCap, label: "Certification Guide", desc: "Recommended certifications for career advancement", gradient: "from-pink-500/10 to-rose-500/10" },
];

type Step = "idle" | "form" | "result";

export default function CareerPage() {
  const [step, setStep] = useState<Step>("idle");
  const [form, setForm] = useState({
    currentRole: "",
    experience: "",
    targetRole: "",
    skills: "",
    goals: "",
  });
  const [roadmap, setRoadmap] = useState<string>("");

  const generateMutation = useMutation({
    mutationFn: () => {
      const prompt = `Generate a detailed, personalized career roadmap for this professional:
- Current Role: ${form.currentRole}
- Years of Experience: ${form.experience}
- Target Role: ${form.targetRole}
- Current Skills: ${form.skills}
- Career Goals: ${form.goals}

Provide:
1. A 6-12 month step-by-step action plan
2. Top 5 skills to develop
3. 3 recommended certifications
4. Estimated salary range for target role
5. Key milestones to track progress

Format with clear sections and bullet points.`;

      return api.generateAI(
        prompt,
        "You are an expert career coach and advisor with 20+ years of experience helping professionals advance their careers. Provide specific, actionable, and realistic career guidance.",
        0.7,
        2000
      );
    },
    onSuccess: (res) => {
      if (res.data?.content) {
        setRoadmap(res.data.content);
        setStep("result");
        toast.success("Your career roadmap is ready!");
      }
    },
    onError: () => toast.error("Failed to generate roadmap. Please try again."),
  });

  const handleGenerate = () => {
    if (!form.currentRole.trim() || !form.targetRole.trim()) {
      toast.warning("Please fill in your current and target role.");
      return;
    }
    generateMutation.mutate();
  };

  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Career Copilot</h1>
          <p className="text-[var(--muted-foreground)]">AI-powered career intelligence and growth planning.</p>
        </div>
        {step !== "idle" && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setStep("idle"); setRoadmap(""); }}>
            <RefreshCw className="size-3.5" /> Start Over
          </Button>
        )}
      </motion.div>

      {/* Idle — CTA card */}
      {step === "idle" && (
        <motion.div variants={fadeUp} custom={1}>
          <Card className="border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-transparent">
            <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10 flex-shrink-0">
                <Brain className="size-7 text-[var(--primary)]" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">Start Your Career Journey</h2>
                <p className="text-[var(--muted-foreground)] text-sm">
                  Tell us about your current role, experience level, and career goals. Our AI will create a personalized roadmap.
                </p>
              </div>
              <Button variant="glow" className="gap-1.5 flex-shrink-0" onClick={() => setStep("form")}>
                <Sparkles className="size-4" />
                Begin Assessment
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Assessment Form */}
      {step === "form" && (
        <motion.div variants={fadeUp} custom={1}>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-lg">Career Assessment</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Current Role *</label>
                  <input
                    type="text"
                    placeholder="e.g., Junior Software Engineer"
                    value={form.currentRole}
                    onChange={(e) => setForm((f) => ({ ...f, currentRole: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Years of Experience</label>
                  <select
                    value={form.experience}
                    onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                  >
                    <option value="">Select…</option>
                    {["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Target Role *</label>
                  <input
                    type="text"
                    placeholder="e.g., Staff Engineer at FAANG"
                    value={form.targetRole}
                    onChange={(e) => setForm((f) => ({ ...f, targetRole: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Current Skills</label>
                  <input
                    type="text"
                    placeholder="e.g., React, Node.js, SQL, Python"
                    value={form.skills}
                    onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Career Goals & Motivations</label>
                <textarea
                  rows={3}
                  placeholder="Describe what you want to achieve in your career in the next 1-2 years…"
                  value={form.goals}
                  onChange={(e) => setForm((f) => ({ ...f, goals: e.target.value }))}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none"
                />
              </div>
              <Button
                variant="glow"
                className="gap-1.5 w-full"
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <><Loader2 className="size-4 animate-spin" /> Generating your roadmap…</>
                ) : (
                  <><Brain className="size-4" /> Generate Career Roadmap</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Result */}
      {step === "result" && roadmap && (
        <motion.div variants={fadeUp} custom={1}>
          <Card className="border-[var(--primary)]/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="size-5 text-[var(--primary)]" />
                <h2 className="font-semibold text-lg">Your Personalized Career Roadmap</h2>
              </div>
              <div className="prose prose-sm max-w-none">
                {roadmap.split("\n").map((line, i) => {
                  if (!line.trim()) return <br key={i} />;
                  if (line.startsWith("## ") || line.startsWith("# "))
                    return <h3 key={i} className="font-bold text-base mt-4 mb-2">{line.replace(/^#+ /, "")}</h3>;
                  if (line.startsWith("- ") || line.startsWith("• "))
                    return <p key={i} className="flex gap-2 text-sm text-[var(--muted-foreground)] mb-1"><span className="text-[var(--primary)]">•</span>{line.replace(/^[-•] /, "")}</p>;
                  if (/^\d+\./.test(line))
                    return <p key={i} className="text-sm text-[var(--muted-foreground)] mb-1 pl-2">{line}</p>;
                  if (line.startsWith("**") && line.endsWith("**"))
                    return <p key={i} className="font-semibold text-sm mt-3">{line.replace(/\*\*/g, "")}</p>;
                  return <p key={i} className="text-sm text-[var(--muted-foreground)] mb-1">{line}</p>;
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Features Grid */}
      {step === "idle" && (
        <motion.div variants={fadeUp} custom={2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {copilotFeatures.map((feature, i) => (
              <motion.div key={feature.label} variants={fadeUp} custom={i + 3}>
                <Card className="group h-full cursor-pointer hover:shadow-md hover:border-[var(--primary)]/20 transition-all overflow-hidden">
                  <CardContent className="p-6 relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative">
                      <feature.icon className="size-6 text-[var(--primary)] mb-3" />
                      <div className="font-semibold text-sm mb-1">{feature.label}</div>
                      <div className="text-xs text-[var(--muted-foreground)] leading-relaxed">{feature.desc}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
