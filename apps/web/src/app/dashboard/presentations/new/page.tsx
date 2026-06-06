"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  FileText,
  Upload,
  Wand2,
  Layout,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowRight,
  Loader2,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreatePresentationRequest, type PresentationResponse } from "@/lib/api";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

/* ── Source type options ─────────────────────────────────── */
const sourceTypes = [
  { id: "PROMPT", label: "From Prompt", icon: Wand2, desc: "Describe your topic and let AI create slides" },
  { id: "PDF",    label: "From PDF",    icon: FileText, desc: "Upload a PDF and transform it into a deck" },
  { id: "URL",    label: "From URL",    icon: Layout,   desc: "Paste a link to generate slides from web content" },
];

/* ── Style / tone / layout options ──────────────────────── */
const styles  = ["minimal", "modern", "corporate", "creative", "academic"];
const tones   = ["formal", "casual", "persuasive", "educational", "inspirational"];
const layouts = ["balanced", "default", "text-heavy", "visual-heavy"];

/* ── Animated generation progress steps ─────────────────── */
const GENERATION_STEPS = [
  "Sending prompt to AI…",
  "Structuring slide outline…",
  "Writing slide content…",
  "Adding speaker notes…",
  "Finalising deck…",
];

function GenerationProgress() {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, GENERATION_STEPS.length - 1));
    }, 6000); // advance step every 6 s
    return () => clearInterval(id);
  }, []);

  const progress = Math.round(((stepIdx + 1) / GENERATION_STEPS.length) * 90); // max 90% — completes to 100 on success

  return (
    <Card className="border-[var(--primary)]/30 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 flex-shrink-0">
            <Sparkles className="size-5 text-[var(--primary)] animate-pulse" />
          </div>
          <div>
            <p className="font-semibold text-sm">AI is generating your presentation</p>
            <p className="text-xs text-[var(--muted-foreground)]">This typically takes 15–45 seconds</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden mb-3">
          <motion.div
            className="h-full rounded-full bg-[var(--primary)]"
            initial={{ width: "5%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {/* Step list */}
        <ul className="space-y-2 mt-4">
          {GENERATION_STEPS.map((step, i) => (
            <li key={i} className="flex items-center gap-2.5 text-xs">
              {i < stepIdx ? (
                <CheckCircle2 className="size-3.5 text-emerald-500 flex-shrink-0" />
              ) : i === stepIdx ? (
                <Loader2 className="size-3.5 text-[var(--primary)] animate-spin flex-shrink-0" />
              ) : (
                <div className="size-3.5 rounded-full border border-[var(--muted-foreground)]/30 flex-shrink-0" />
              )}
              <span className={i <= stepIdx ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}>
                {step}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-[var(--muted-foreground)] mt-4 text-center">
          Please wait — do not close this tab
        </p>
      </CardContent>
    </Card>
  );
}

/* ── Inline slide preview after successful generation ────── */
function SlidePreview({ presentation }: { presentation: PresentationResponse }) {
  const router = useRouter();
  const [slideIdx, setSlideIdx] = useState(0);

  const slides = presentation.slides ?? [];
  const total = slides.length;
  const current = slides[slideIdx];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-emerald-500/30">
        <CardContent className="p-6">
          {/* Success header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 flex-shrink-0">
              <CheckCircle2 className="size-5 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Presentation generated!</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">
                &ldquo;{presentation.title}&rdquo; · {total} slides · {presentation.style}
              </p>
            </div>
          </div>

          {/* Slide viewer */}
          {total > 0 && current ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={slideIdx}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 p-5 mb-3 min-h-[160px]"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] font-bold">
                      {current.order}
                    </span>
                    <h3 className="font-semibold text-sm">{current.title}</h3>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed line-clamp-6">
                    {current.content || <span className="italic">No content</span>}
                  </p>
                  {current.notes && (
                    <p className="text-[10px] text-amber-600 mt-3 border-t border-[var(--border)] pt-2 line-clamp-2">
                      📝 {current.notes}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Nav */}
              <div className="flex items-center justify-between mb-5">
                <Button
                  variant="outline" size="sm" className="gap-1"
                  onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
                  disabled={slideIdx === 0}
                >
                  <ChevronLeft className="size-3.5" /> Prev
                </Button>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {slideIdx + 1} / {total}
                </span>
                <Button
                  variant="outline" size="sm" className="gap-1"
                  onClick={() => setSlideIdx((i) => Math.min(total - 1, i + 1))}
                  disabled={slideIdx >= total - 1}
                >
                  Next <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <Layers className="size-8 text-[var(--muted-foreground)] mb-2 opacity-40" />
              <p className="text-xs text-[var(--muted-foreground)]">Slides will appear here once processed.</p>
            </div>
          )}

          {/* CTA */}
          <Button
            variant="glow"
            className="w-full gap-1.5"
            onClick={() => router.push("/dashboard/presentations")}
          >
            <Eye className="size-4" />
            View All Presentations
            <ArrowRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── New Presentation Page ──────────────────────────────── */
export default function NewPresentationPage() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt]           = useState("");
  const [sourceType, setSourceType]   = useState("PROMPT");
  const [slideCount, setSlideCount]   = useState(10);
  const [style, setStyle]             = useState("minimal");
  const [tone, setTone]               = useState("formal");
  const [layout, setLayout]           = useState("balanced");
  const [pdfFile, setPdfFile]         = useState<File | null>(null);
  const [error, setError]             = useState<string | null>(null);

  /* Holds the completed presentation for the inline preview */
  const [generatedPresentation, setGeneratedPresentation] = useState<PresentationResponse | null>(null);

  /* ── Create mutation ─────────────────────────────────── */
  const createMutation = useMutation({
    mutationFn: (req: CreatePresentationRequest) => api.createPresentation(req),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["presentations"] });
      queryClient.invalidateQueries({ queryKey: ["presentations-count"] });
      queryClient.invalidateQueries({ queryKey: ["recent-presentations"] });

      const presentation = res.data;
      if (presentation) {
        setGeneratedPresentation(presentation);
      }

      toast.success("Presentation generated!", {
        description: `"${res.data?.title}" · ${res.data?.slideCount} slides`,
      });
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "Failed to generate presentation. Please try again.";
      setError(msg);
      toast.error("Generation failed", { description: msg });
    },
  });

  /* ── Validation & submit ─────────────────────────────── */
  const handleGenerate = () => {
    setError(null);
    setGeneratedPresentation(null);

    if (sourceType === "PROMPT" && !prompt.trim()) {
      setError("Please enter a topic or prompt to generate slides.");
      return;
    }
    if (sourceType === "URL" && !prompt.trim()) {
      setError("Please enter a URL to generate slides from.");
      return;
    }
    if (sourceType === "PDF" && !pdfFile) {
      setError("Please upload a PDF file.");
      return;
    }
    if (sourceType === "PROMPT" && prompt.trim().length > 5000) {
      setError("Prompt is too long. Please keep it under 5,000 characters.");
      return;
    }

    const req: CreatePresentationRequest = {
      // Backend @NotBlank: for PDF use filename, for others use the prompt text
      prompt: sourceType === "PDF"
        ? (pdfFile?.name ?? "Uploaded PDF presentation")
        : prompt.trim(),
      sourceType,
      sourceUrl: sourceType === "URL" ? prompt.trim() : undefined,
      slideCount,
      style,
      tone,
      layout,
    };

    createMutation.mutate(req);
  };

  const isGenerating = createMutation.isPending;

  /* Reset form when source type changes */
  const handleSourceTypeChange = (id: string) => {
    setSourceType(id);
    setPrompt("");
    setPdfFile(null);
    setError(null);
    setGeneratedPresentation(null);
  };

  return (
    <motion.div className="max-w-4xl space-y-8" initial="hidden" animate="visible">

      {/* Header */}
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Create Presentation</h1>
        <p className="text-[var(--muted-foreground)]">
          Generate AI-powered slide decks in seconds. Choose a source, configure options, and let AI do the work.
        </p>
      </motion.div>

      {/* Source Type Selector */}
      <motion.div variants={fadeUp} custom={1}>
        <label className="text-sm font-semibold mb-3 block">Source Type</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sourceTypes.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSourceTypeChange(s.id)}
              disabled={isGenerating}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                sourceType === s.id
                  ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm"
                  : "border-[var(--border)] hover:border-[var(--primary)]/30"
              }`}
            >
              <s.icon className={`size-5 mb-2 ${sourceType === s.id ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} />
              <div className="text-sm font-medium mb-0.5">{s.label}</div>
              <div className="text-xs text-[var(--muted-foreground)]">{s.desc}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Prompt / URL / PDF Input */}
      <motion.div variants={fadeUp} custom={2}>
        <label htmlFor="prompt-input" className="text-sm font-semibold mb-2 block">
          {sourceType === "URL" ? "Web URL" : sourceType === "PDF" ? "Upload PDF" : "Topic / Prompt"}
        </label>

        {sourceType === "PDF" ? (
          <div
            onClick={() => !isGenerating && fileRef.current?.click()}
            className={`flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed transition-colors ${
              isGenerating ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            } ${
              pdfFile
                ? "border-[var(--primary)] bg-[var(--primary)]/5"
                : "border-[var(--border)] hover:border-[var(--primary)]/30 hover:bg-[var(--accent)]/30"
            }`}
          >
            {pdfFile ? (
              <div className="text-center">
                <CheckCircle2 className="size-8 text-[var(--primary)] mx-auto mb-2" />
                <p className="text-sm font-medium">{pdfFile.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  {!isGenerating && (
                    <button
                      className="ml-2 text-[var(--primary)] hover:underline"
                      onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                    >
                      Change
                    </button>
                  )}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="size-8 text-[var(--muted-foreground)] mx-auto mb-2" />
                <p className="text-sm text-[var(--muted-foreground)]">Click or drag to upload PDF</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 opacity-60">Max 20 MB</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setPdfFile(f); setError(null); e.target.value = ""; }
              }}
            />
          </div>
        ) : (
          <>
            <textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); setError(null); }}
              disabled={isGenerating}
              rows={sourceType === "URL" ? 2 : 4}
              maxLength={5000}
              placeholder={
                sourceType === "URL"
                  ? "https://en.wikipedia.org/wiki/..."
                  : "e.g., Quarterly business review for Q4 2025 with financial highlights, team achievements, and roadmap for 2026…"
              }
              className={`w-full rounded-2xl border bg-[var(--background)] px-4 py-3 text-sm
                placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2
                focus:ring-[var(--ring)] transition-all resize-none disabled:opacity-50 ${
                  error && !prompt.trim() ? "border-[var(--destructive)]" : "border-[var(--border)]"
                }`}
            />
            <div className="flex items-center justify-between mt-1">
              <span />
              <span className={`text-xs ${prompt.length > 4800 ? "text-amber-500" : "text-[var(--muted-foreground)]"}`}>
                {prompt.length}/5000
              </span>
            </div>
          </>
        )}
      </motion.div>

      {/* Options Row: Slides + Style + Tone */}
      <motion.div variants={fadeUp} custom={3} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Slide count */}
        <div>
          <label className="text-sm font-semibold mb-2 flex items-center justify-between">
            Slides
            <Badge variant="outline" className="font-bold">{slideCount}</Badge>
          </label>
          <input
            type="range"
            min={3}
            max={30}
            value={slideCount}
            onChange={(e) => setSlideCount(Number(e.target.value))}
            disabled={isGenerating}
            className="w-full accent-[var(--primary)] disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
            <span>3 min</span>
            <span>30 max</span>
          </div>
        </div>

        {/* Style */}
        <div>
          <label className="text-sm font-semibold mb-2 block">Style</label>
          <div className="flex flex-wrap gap-1.5">
            {styles.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                disabled={isGenerating}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer disabled:opacity-50 ${
                  style === s
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div>
          <label className="text-sm font-semibold mb-2 block">Tone</label>
          <div className="flex flex-wrap gap-1.5">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                disabled={isGenerating}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer disabled:opacity-50 ${
                  tone === t
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Layout (advanced option) */}
      <motion.div variants={fadeUp} custom={4}>
        <label className="text-sm font-semibold mb-2 block">Layout</label>
        <div className="flex flex-wrap gap-1.5">
          {layouts.map((l) => (
            <button
              key={l}
              onClick={() => setLayout(l)}
              disabled={isGenerating}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer disabled:opacity-50 ${
                layout === l
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--muted-foreground)] mt-1.5">
          Controls the visual balance between text and space in each slide.
        </p>
      </motion.div>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 text-sm text-[var(--destructive)]"
          >
            <AlertCircle className="size-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Button — disabled while generating OR if result is already shown */}
      {!generatedPresentation && (
        <motion.div variants={fadeUp} custom={5}>
          <Button
            variant="glow"
            size="xl"
            className="w-full gap-2.5 text-base font-semibold"
            onClick={handleGenerate}
            disabled={isGenerating}
            id="generate-presentation-btn"
          >
            {isGenerating ? (
              <>
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating… this may take up to 45 seconds
              </>
            ) : (
              <>
                <Sparkles className="size-5" />
                Generate Presentation
              </>
            )}
          </Button>
          {!isGenerating && (
            <p className="text-xs text-center text-[var(--muted-foreground)] mt-2">
              Powered by multi-model AI (Gemini + Groq) · Results vary by prompt clarity
            </p>
          )}
        </motion.div>
      )}

      {/* Generation progress indicator (shown while pending) */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <GenerationProgress />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline slide preview after successful generation */}
      <AnimatePresence>
        {generatedPresentation && !isGenerating && (
          <SlidePreview presentation={generatedPresentation} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
