"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Upload, Target, Sparkles, BarChart3, ArrowRight,
  Loader2, AlertCircle, CheckCircle2, TrendingUp, X, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
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

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

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

function AnalysisPanel({ analysis, onClose }: { analysis: AnalysisResponse; onClose: () => void }) {
  const scoreColor = analysis.overallScore >= 80 ? "#22c55e" : analysis.overallScore >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card className="border-[var(--primary)]/20">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Analysis Results</h3>
              {analysis.jobTitle && (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Target: {analysis.jobTitle}
                  {analysis.companyName && ` @ ${analysis.companyName}`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: scoreColor }}>
                  {analysis.overallScore}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">Overall</div>
              </div>
              <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="flex flex-wrap justify-around gap-4 mb-6 p-4 rounded-2xl bg-[var(--muted)]/30">
            <ScoreRing score={analysis.atsScore.score} label="ATS" color="#8b5cf6" />
            <ScoreRing score={analysis.contentScore.score} label="Content" color="#06b6d4" />
            <ScoreRing score={analysis.structureScore.score} label="Structure" color="#10b981" />
            <ScoreRing score={analysis.skillsScore.score} label="Skills" color="#f59e0b" />
            <ScoreRing score={analysis.toneScore.score} label="Tone" color="#ec4899" />
          </div>

          {/* Missing Keywords */}
          {analysis.missingKeywords.length > 0 && (
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
          {analysis.recommendations.length > 0 && (
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

          <div className="mt-4 text-xs text-[var(--muted-foreground)] text-right">
            Analyzed by {analysis.aiProvider} · {new Date(analysis.createdAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ResumeCard({
  resume,
  onAnalyze,
  isAnalyzing,
}: {
  resume: ResumeResponse;
  onAnalyze: (id: string) => void;
  isAnalyzing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="hover:shadow-md hover:border-[var(--primary)]/20 transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 flex-shrink-0">
            <FileText className="size-5 text-[var(--primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{resume.title}</div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {resume.fileType} · {new Date(resume.createdAt).toLocaleDateString()}
              {resume.isBuilderCreated && " · Builder"}
            </div>
          </div>
          <Button
            size="sm"
            variant="glow"
            className="gap-1.5 flex-shrink-0"
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
      </CardContent>
    </Card>
  );
}

export default function ResumesPage() {
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResponse | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showJobFields, setShowJobFields] = useState(false);
  const [pendingResumeId, setPendingResumeId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch existing resumes
  const { data: resumesData, isLoading: isLoadingResumes } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.listResumes(0, 20),
    staleTime: 15_000,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.uploadResume(file),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["resumes-count"] });
      toast.success("Resume uploaded!", { description: res.data?.title });
    },
    onError: (err) => {
      toast.error("Upload failed", { description: err instanceof Error ? err.message : "Unknown error" });
    },
  });

  // Analyze mutation
  const analyzeMutation = useMutation({
    mutationFn: ({ resumeId }: { resumeId: string }) =>
      api.analyzeResume(resumeId, jobTitle || undefined, jobDescription || undefined, companyName || undefined),
    onSuccess: (res) => {
      if (res.data) setActiveAnalysis(res.data);
      setAnalyzingId(null);
      setPendingResumeId(null);
      toast.success("Analysis complete!", { description: `Overall score: ${res.data?.overallScore}/100` });
    },
    onError: (err) => {
      setAnalyzingId(null);
      toast.error("Analysis failed", { description: err instanceof Error ? err.message : "Unknown error" });
    },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleUpload(files[0]);
  };

  const handleUpload = (file: File) => {
    if (!file.name.match(/\.(pdf|docx)$/i)) {
      toast.error("Invalid file type", { description: "Only PDF and DOCX are supported." });
      return;
    }
    uploadMutation.mutate(file);
  };

  const handleAnalyze = (resumeId: string) => {
    setAnalyzingId(resumeId);
    setActiveAnalysis(null);
    analyzeMutation.mutate({ resumeId });
  };

  const handleAnalyzeWithJob = () => {
    if (!pendingResumeId) return;
    setShowJobFields(false);
    handleAnalyze(pendingResumeId);
  };

  const resumes = resumesData?.data?.content ?? [];

  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Resume Analyzer</h1>
        <p className="text-[var(--muted-foreground)]">Upload your resume and get instant ATS scoring with AI-powered feedback.</p>
      </motion.div>

      {/* Upload Area */}
      <motion.div variants={fadeUp} custom={1}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
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
              <p className="text-sm text-[var(--muted-foreground)] mb-4">or click to browse • PDF, DOCX supported</p>
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
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
        </div>
      </motion.div>

      {/* Optional Job Context Fields */}
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Analysis Result */}
      <AnimatePresence>
        {activeAnalysis && (
          <motion.div variants={fadeUp} custom={3}>
            <AnalysisPanel analysis={activeAnalysis} onClose={() => setActiveAnalysis(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Resumes */}
      {(isLoadingResumes || resumes.length > 0) && (
        <motion.div variants={fadeUp} custom={4}>
          <h2 className="text-lg font-semibold mb-4">Your Resumes</h2>
          {isLoadingResumes ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-6 text-[var(--primary)] animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={analyzingId === resume.id && analyzeMutation.isPending}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* What You'll Get */}
      <motion.div variants={fadeUp} custom={5}>
        <h2 className="text-lg font-semibold mb-4">What you&apos;ll get</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Target, label: "ATS Score", desc: "See how your resume performs with applicant tracking systems" },
            { icon: BarChart3, label: "Detailed Analysis", desc: "Content, structure, skills, and tone evaluation" },
            { icon: Sparkles, label: "AI Recommendations", desc: "Actionable tips to improve your resume" },
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
    </motion.div>
  );
}
