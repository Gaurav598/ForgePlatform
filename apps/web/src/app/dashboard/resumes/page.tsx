"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Upload, Target, Sparkles, BarChart3, ArrowRight,
  Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp,
  Clock, X, History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ResumeResponse, type AnalysisResponse } from "@/lib/api";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

/* ── Score Ring ─────────────────────────────────────────── */
function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-16 w-16">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={radius} fill="none" stroke="var(--muted)" strokeWidth="4" />
          <circle
            cx="28" cy="28" r={radius} fill="none"
            stroke={color} strokeWidth="4"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{score}</span>
      </div>
      <span className="text-xs text-[var(--muted-foreground)] text-center leading-tight">{label}</span>
    </div>
  );
}

/* ── Analysis Panel ─────────────────────────────────────── */
function AnalysisPanel({ analysis, onClose }: { analysis: AnalysisResponse; onClose?: () => void }) {
  const scoreColor = analysis.overallScore >= 80 ? "#22c55e" : analysis.overallScore >= 60 ? "#f59e0b" : "#ef4444";

  // Null-safe score sections
  const atsScore = analysis.atsScore?.score ?? 0;
  const contentScore = analysis.contentScore?.score ?? 0;
  const structureScore = analysis.structureScore?.score ?? 0;
  const skillsScore = analysis.skillsScore?.score ?? 0;
  const toneScore = analysis.toneScore?.score ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card className="border-[var(--primary)]/20">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Analysis Results</h3>
              {analysis.jobTitle && (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Target: {analysis.jobTitle}
                  {analysis.companyName && ` @ ${analysis.companyName}`}
                </p>
              )}
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                via {analysis.aiProvider} · {new Date(analysis.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: scoreColor }}>
                  {analysis.overallScore}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">Overall</div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>
          </div>

          {/* Score breakdown */}
          <div className="flex flex-wrap justify-around gap-4 mb-6 p-4 rounded-2xl bg-[var(--muted)]/30">
            <ScoreRing score={atsScore} label="ATS" color="#8b5cf6" />
            <ScoreRing score={contentScore} label="Content" color="#06b6d4" />
            <ScoreRing score={structureScore} label="Structure" color="#10b981" />
            <ScoreRing score={skillsScore} label="Skills" color="#f59e0b" />
            <ScoreRing score={toneScore} label="Tone" color="#ec4899" />
          </div>

          {/* Missing Keywords */}
          {(analysis.missingKeywords ?? []).length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <AlertCircle className="size-4 text-amber-500" />
                Missing Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingKeywords.map((kw) => (
                  <Badge key={kw} variant="outline" className="text-xs bg-amber-500/10 border-amber-500/20 text-amber-600">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {(analysis.recommendations ?? []).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Sparkles className="size-4 text-[var(--primary)]" />
                AI Recommendations
              </h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="size-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--muted-foreground)]">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Resume Card ────────────────────────────────────────── */
function ResumeCard({
  resume,
  onAnalyze,
  isAnalyzing,
  jobTitle,
  jobDescription,
  companyName,
}: {
  resume: ResumeResponse;
  onAnalyze: (id: string) => void;
  isAnalyzing: boolean;
  jobTitle: string;
  jobDescription: string;
  companyName: string;
}) {
  const [showHistory, setShowHistory] = useState(false);

  const { data: analysesData, isLoading: loadingAnalyses } = useQuery({
    queryKey: ["analyses", resume.id],
    queryFn: () => api.getResumeAnalyses(resume.id),
    enabled: showHistory,
    staleTime: 30_000,
  });

  const analyses = analysesData?.data ?? [];

  return (
    <Card className="hover:shadow-md hover:border-[var(--primary)]/20 transition-all duration-300">
      <CardContent className="p-5">
        {/* Main row */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 flex-shrink-0">
            <FileText className="size-5 text-[var(--primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{resume.title}</div>
            <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5 flex-wrap">
              <span>{resume.fileType}</span>
              <span>·</span>
              <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
              {resume.isBuilderCreated && (
                <>
                  <span>·</span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5">Builder</Badge>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              onClick={() => setShowHistory((v) => !v)}
              title="View past analyses"
            >
              <History className="size-3.5" />
              {showHistory ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </Button>
            <Button
              size="sm"
              variant="glow"
              className="gap-1.5"
              onClick={() => onAnalyze(resume.id)}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Target className="size-3.5" />
              )}
              {isAnalyzing ? "Analyzing…" : "Analyze"}
            </Button>
          </div>
        </div>

        {/* Past analyses */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                {loadingAnalyses ? (
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] py-2">
                    <Loader2 className="size-4 animate-spin" />
                    Loading analyses…
                  </div>
                ) : analyses.length === 0 ? (
                  <p className="text-xs text-[var(--muted-foreground)] py-2">
                    No analyses yet. Click &quot;Analyze&quot; to get started.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-[var(--muted-foreground)]">
                      Past Analyses ({analyses.length})
                    </p>
                    {analyses.map((analysis) => (
                      <AnalysisPanel key={analysis.id} analysis={analysis} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

/* ── Main Page ──────────────────────────────────────────── */
export default function ResumesPage() {
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResponse | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showJobFields, setShowJobFields] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Fetch existing resumes ─────────────────────────── */
  const { data: resumesData, isLoading: isLoadingResumes } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.listResumes(0, 50),
    staleTime: 15_000,
  });

  /* ── Upload mutation ────────────────────────────────── */
  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.uploadResume(file),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["resumes-count"] });
      toast.success("Resume uploaded!", {
        description: res.data?.title ?? "Your resume is ready to analyze.",
      });
    },
    onError: (err) => {
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : "Unknown error. Please try again.",
      });
    },
  });

  /* ── Analyze mutation ───────────────────────────────── */
  const analyzeMutation = useMutation({
    mutationFn: ({ resumeId }: { resumeId: string }) =>
      api.analyzeResume(
        resumeId,
        jobTitle || undefined,
        jobDescription || undefined,
        companyName || undefined,
      ),
    onSuccess: (res) => {
      if (res.data) {
        setActiveAnalysis(res.data);
        // Invalidate the per-resume analyses cache so history refreshes
        queryClient.invalidateQueries({ queryKey: ["analyses", res.data.resumeId] });
      }
      setAnalyzingId(null);
      toast.success("Analysis complete!", {
        description: `Overall score: ${res.data?.overallScore ?? "—"}/100`,
      });
    },
    onError: (err) => {
      setAnalyzingId(null);
      toast.error("Analysis failed", {
        description: err instanceof Error ? err.message : "Unknown error. Please try again.",
      });
    },
  });

  /* ── Handlers ───────────────────────────────────────── */
  const handleUpload = useCallback((file: File) => {
    if (!file.name.match(/\.(pdf|docx)$/i)) {
      toast.error("Invalid file type", {
        description: "Only PDF and DOCX files are supported.",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", { description: "Maximum file size is 10 MB." });
      return;
    }
    uploadMutation.mutate(file);
  }, [uploadMutation]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleUpload(files[0]);
  };

  const handleAnalyze = (resumeId: string) => {
    setAnalyzingId(resumeId);
    setActiveAnalysis(null);
    analyzeMutation.mutate({ resumeId });
  };

  const resumes = resumesData?.data?.content ?? [];
  const totalResumes = resumesData?.data?.totalElements ?? 0;

  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">

      {/* Header */}
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Resume Analyzer</h1>
        <p className="text-[var(--muted-foreground)]">
          Upload your resume and get instant ATS scoring with AI-powered feedback.
        </p>
      </motion.div>

      {/* Upload Area */}
      <motion.div variants={fadeUp} custom={1}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploadMutation.isPending && fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
          aria-label="Upload resume — click or drag and drop"
          className={`flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
            dragOver
              ? "border-[var(--primary)] bg-[var(--primary)]/5 glow-sm"
              : "border-[var(--border)] hover:border-[var(--primary)]/30 hover:bg-[var(--accent)]/30"
          }`}
        >
          {uploadMutation.isPending ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-10 text-[var(--primary)] animate-spin" />
              <p className="text-sm text-[var(--muted-foreground)]">Uploading resume…</p>
            </div>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 mb-4">
                <Upload className="size-7 text-[var(--primary)]" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Drop your resume here</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                or click to browse · PDF and DOCX supported · Max 10 MB
              </p>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={(e) => e.stopPropagation()}>
                <FileText className="size-3.5" />
                Browse Files
              </Button>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleUpload(e.target.files[0]);
                // Reset so the same file can be re-uploaded if needed
                e.target.value = "";
              }
            }}
          />
        </div>
      </motion.div>

      {/* Optional Job Context */}
      <motion.div variants={fadeUp} custom={2}>
        <button
          onClick={() => setShowJobFields(!showJobFields)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          <Sparkles className="size-4" />
          Add job context for targeted analysis (optional)
          <ChevronDown className={`size-4 transition-transform ${showJobFields ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {showJobFields && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <input
                  type="text"
                  placeholder="Job title (e.g. Senior Engineer)"
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
                <textarea
                  placeholder="Paste job description…"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={1}
                  className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none"
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-2">
                Job context lets the AI tailor keyword analysis and recommendations to your target role.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Active Analysis Result */}
      <AnimatePresence>
        {activeAnalysis && (
          <motion.div variants={fadeUp} custom={3}>
            <AnalysisPanel
              analysis={activeAnalysis}
              onClose={() => setActiveAnalysis(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume List */}
      <motion.div variants={fadeUp} custom={4}>
        {isLoadingResumes ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 text-[var(--primary)] animate-spin" />
              <p className="text-sm text-[var(--muted-foreground)]">Loading your resumes…</p>
            </div>
          </div>
        ) : resumes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]/50 mx-auto mb-4">
                <FileText className="size-8 text-[var(--muted-foreground)] opacity-50" />
              </div>
              <h3 className="font-semibold mb-1">No resumes yet</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto">
                Upload a PDF or DOCX resume above to get instant ATS scoring and AI feedback.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="glow"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="size-3.5" />
                  Upload Resume
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <a href="/dashboard/resume-builder">
                    <ArrowRight className="size-3.5" />
                    Build from Scratch
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Your Resumes
                <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                  ({totalResumes})
                </span>
              </h2>
            </div>
            <div className="space-y-3">
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={analyzingId === resume.id && analyzeMutation.isPending}
                  jobTitle={jobTitle}
                  jobDescription={jobDescription}
                  companyName={companyName}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Feature callouts */}
      <motion.div variants={fadeUp} custom={5}>
        <h2 className="text-lg font-semibold mb-4">What you&apos;ll get</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Target, label: "ATS Score", desc: "See exactly how your resume performs with applicant tracking systems" },
            { icon: BarChart3, label: "Detailed Analysis", desc: "Content, structure, skills, and tone scored individually" },
            { icon: Sparkles, label: "AI Recommendations", desc: "Actionable, specific tips to improve your resume" },
          ].map((item) => (
            <Card key={item.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 mb-3">
                  <item.icon className="size-5 text-[var(--primary)]" />
                </div>
                <div className="font-semibold text-sm mb-1">{item.label}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{item.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* History tip */}
      <motion.div variants={fadeUp} custom={6}>
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <Clock className="size-3.5" />
          All analysis results are saved. Click the history icon on any resume to view past analyses.
        </div>
      </motion.div>
    </motion.div>
  );
}
