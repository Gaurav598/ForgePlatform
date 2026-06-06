"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target, Search, BarChart3, CheckCircle, Loader2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export default function JobsPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [result, setResult] = useState<string | null>(null);

  // Load user's resumes for selection
  const { data: resumesData } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.listResumes(0, 20),
    staleTime: 30_000,
  });

  const resumes = resumesData?.data?.content ?? [];

  const analyzeMutation = useMutation({
    mutationFn: () =>
      api.analyzeResume(selectedResumeId, jobTitle || undefined, jobDescription || undefined, companyName || undefined),
    onSuccess: (res) => {
      if (res.data) {
        const score = res.data.overallScore;
        const recs = res.data.recommendations;
        const missing = res.data.missingKeywords;
        setResult(
          `**Match Score: ${score}/100**\n\n` +
          (missing.length > 0 ? `**Missing Keywords:** ${missing.join(", ")}\n\n` : "") +
          (recs.length > 0 ? `**Recommendations:**\n${recs.map((r) => `• ${r}`).join("\n")}` : "")
        );
        toast.success(`Match score: ${score}/100`);
      }
    },
    onError: (err) => {
      toast.error("Analysis failed", { description: err instanceof Error ? err.message : "Unknown error" });
    },
  });

  const handleAnalyze = () => {
    if (!selectedResumeId) { toast.warning("Please select a resume first."); return; }
    if (!jobDescription.trim()) { toast.warning("Please enter a job description."); return; }
    setResult(null);
    analyzeMutation.mutate();
  };

  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Job Matching</h1>
        <p className="text-[var(--muted-foreground)]">Match your resume to job descriptions and identify skill gaps.</p>
      </motion.div>

      <motion.div variants={fadeUp} custom={1}>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">Analyze Job Match</h2>

            {/* Resume selector */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Select Resume</label>
              {resumes.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No resumes uploaded yet.{" "}
                  <a href="/dashboard/resumes" className="text-[var(--primary)] hover:underline">Upload one first →</a>
                </p>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                >
                  <option value="">— Select a resume —</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Job title (e.g. Backend Engineer)"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
              />
              <input
                type="text"
                placeholder="Company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
              />
            </div>

            {/* Job description */}
            <textarea
              rows={5}
              placeholder="Paste the job description here…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none"
            />

            <Button
              variant="glow"
              className="gap-1.5"
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending}
            >
              {analyzeMutation.isPending ? (
                <><Loader2 className="size-4 animate-spin" /> Analyzing…</>
              ) : (
                <><Target className="size-4" /> Analyze Match</>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
            <Card className="border-[var(--primary)]/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="size-4 text-[var(--primary)]" />
                  Match Analysis
                </h3>
                <div className="space-y-2">
                  {result.split("\n").filter(Boolean).map((line, i) => (
                    <p key={i} className={`text-sm ${line.startsWith("**") ? "font-semibold" : "text-[var(--muted-foreground)]"}`}>
                      {line.replace(/\*\*/g, "")}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Cards */}
      <motion.div variants={fadeUp} custom={2}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: BarChart3, label: "Match Score", desc: "See how well your resume matches the job requirements" },
            { icon: Search, label: "Missing Skills", desc: "Identify skills to add or highlight in your resume" },
            { icon: CheckCircle, label: "Recommendations", desc: "Get specific action items to improve your chances" },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-5 text-center">
                <item.icon className="size-6 text-[var(--primary)] mx-auto mb-2" />
                <div className="font-semibold text-sm mb-1">{item.label}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{item.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
