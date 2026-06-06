"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Plus,
  Presentation,
  FileText,
  Upload,
  Wand2,
  Layout,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
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
  const [prompt, setPrompt] = useState("");
  const [sourceType, setSourceType] = useState("PROMPT");
  const [slideCount, setSlideCount] = useState(10);
  const [style, setStyle] = useState("minimal");
  const [tone, setTone] = useState("formal");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // TODO: Call api.createPresentation() and redirect
    setTimeout(() => setIsGenerating(false), 3000);
  };

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
              onClick={() => setSourceType(s.id)}
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

      {/* Prompt */}
      <motion.div variants={fadeUp} custom={2}>
        <label htmlFor="prompt" className="text-sm font-semibold mb-2 block">
          {sourceType === "URL" ? "URL" : sourceType === "PDF" ? "Upload PDF" : "Topic / Prompt"}
        </label>
        {sourceType === "PDF" ? (
          <div className="flex items-center justify-center h-32 rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors cursor-pointer">
            <div className="text-center">
              <Upload className="size-8 text-[var(--muted-foreground)] mx-auto mb-2" />
              <p className="text-sm text-[var(--muted-foreground)]">Click or drag to upload PDF</p>
            </div>
          </div>
        ) : (
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder={sourceType === "URL" ? "https://..." : "e.g., Quarterly business review for Q4 2025 with financial highlights, team achievements, and roadmap..."}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none"
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

      {/* Generate Button */}
      <motion.div variants={fadeUp} custom={4}>
        <Button
          variant="glow"
          size="xl"
          className="w-full gap-2.5 text-base font-semibold"
          onClick={handleGenerate}
          disabled={isGenerating || (!prompt.trim() && sourceType !== "PDF")}
        >
          {isGenerating ? (
            <>
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
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
