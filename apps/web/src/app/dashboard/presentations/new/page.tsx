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
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreatePresentationRequest } from "@/lib/api";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const sourceTypes = [
  { id: "PROMPT", label: "From Prompt", icon: Wand2, desc: "Describe your topic and let AI create slides" },
  { id: "PDF", label: "From PDF", icon: FileText, desc: "Upload a PDF and transform it into a deck" },
  { id: "URL", label: "From URL", icon: Layout, desc: "Paste a link to generate slides from web content" },
];

const styles = ["minimal", "modern", "corporate", "creative", "academic"];
const tones = ["formal", "casual", "persuasive", "educational", "inspirational"];

export default function NewPresentationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState("");
  const [sourceType, setSourceType] = useState("PROMPT");
  const [slideCount, setSlideCount] = useState(10);
  const [style, setStyle] = useState("minimal");
  const [tone, setTone] = useState("formal");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (req: CreatePresentationRequest) => api.createPresentation(req),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["presentations"] });
      queryClient.invalidateQueries({ queryKey: ["presentations-count"] });
      queryClient.invalidateQueries({ queryKey: ["recent-presentations"] });
      toast.success("Presentation created!", {
        description: `"${res.data?.title}" is ready.`,
      });
      router.push("/dashboard/presentations");
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "Failed to generate presentation";
      setError(msg);
      toast.error("Generation failed", { description: msg });
    },
  });

  const handleGenerate = async () => {
    setError(null);

    if (sourceType === "PROMPT" && !prompt.trim()) {
      setError("Please enter a topic or prompt.");
      return;
    }
    if (sourceType === "URL" && !prompt.trim()) {
      setError("Please enter a URL.");
      return;
    }
    if (sourceType === "PDF" && !pdfFile) {
      setError("Please upload a PDF file.");
      return;
    }

    const req: CreatePresentationRequest = {
      prompt: sourceType === "PDF" ? (pdfFile?.name ?? "Uploaded PDF") : prompt.trim(),
      sourceType,
      sourceUrl: sourceType === "URL" ? prompt.trim() : undefined,
      slideCount,
      style,
      tone,
      layout: "default",
    };

    createMutation.mutate(req);
  };

  const isGenerating = createMutation.isPending;

  return (
    <motion.div className="max-w-4xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Create Presentation</h1>
        <p className="text-[var(--muted-foreground)]">Generate AI-powered slide decks in seconds.</p>
      </motion.div>

      {/* Source Type */}
      <motion.div variants={fadeUp} custom={1}>
        <label className="text-sm font-semibold mb-3 block">Source</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sourceTypes.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSourceType(s.id); setPrompt(""); setPdfFile(null); setError(null); }}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
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

      {/* Prompt / URL / PDF Upload */}
      <motion.div variants={fadeUp} custom={2}>
        <label htmlFor="prompt" className="text-sm font-semibold mb-2 block">
          {sourceType === "URL" ? "URL" : sourceType === "PDF" ? "Upload PDF" : "Topic / Prompt"}
        </label>
        {sourceType === "PDF" ? (
          <div
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed transition-colors cursor-pointer ${
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
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="size-8 text-[var(--muted-foreground)] mx-auto mb-2" />
                <p className="text-sm text-[var(--muted-foreground)]">Click or drag to upload PDF</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setPdfFile(f); setError(null); }
              }}
            />
          </div>
        ) : (
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); setError(null); }}
            rows={4}
            placeholder={
              sourceType === "URL"
                ? "https://..."
                : "e.g., Quarterly business review for Q4 2025 with financial highlights, team achievements, and roadmap..."
            }
            className={`w-full rounded-2xl border bg-[var(--background)] px-4 py-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none ${
              error && !prompt.trim() ? "border-[var(--destructive)]" : "border-[var(--border)]"
            }`}
          />
        )}
      </motion.div>

      {/* Options Row */}
      <motion.div variants={fadeUp} custom={3} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-semibold mb-2 block">Slides</label>
          <input
            type="range"
            min={3}
            max={30}
            value={slideCount}
            onChange={(e) => setSlideCount(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
          />
          <div className="text-xs text-[var(--muted-foreground)] mt-1">{slideCount} slides</div>
        </div>
        <div>
          <label className="text-sm font-semibold mb-2 block">Style</label>
          <div className="flex flex-wrap gap-1.5">
            {styles.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
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
        <div>
          <label className="text-sm font-semibold mb-2 block">Tone</label>
          <div className="flex flex-wrap gap-1.5">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
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

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 text-sm text-[var(--destructive)]"
        >
          <AlertCircle className="size-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Generate Button */}
      <motion.div variants={fadeUp} custom={4}>
        <Button
          variant="glow"
          size="xl"
          className="w-full gap-2.5 text-base font-semibold"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating… This may take up to 30 seconds
            </>
          ) : (
            <>
              <Sparkles className="size-5" />
              Generate Presentation
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
