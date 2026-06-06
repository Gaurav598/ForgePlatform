"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenTool, Layout, Download, Sparkles, FileText, Plus } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const templates = [
  { id: "modern", name: "Modern", color: "oklch(0.7 0.2 270)" },
  { id: "classic", name: "Classic", color: "oklch(0.65 0.2 190)" },
  { id: "creative", name: "Creative", color: "oklch(0.65 0.22 30)" },
  { id: "minimal", name: "Minimal", color: "oklch(0.7 0.18 150)" },
  { id: "executive", name: "Executive", color: "oklch(0.65 0.2 310)" },
  { id: "tech", name: "Tech", color: "oklch(0.6 0.18 225)" },
];

export default function ResumeBuilderPage() {
  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Resume Builder</h1>
        <p className="text-[var(--muted-foreground)]">Build a professional resume from scratch with AI assistance.</p>
      </motion.div>

      {/* Template Selection */}
      <motion.div variants={fadeUp} custom={1}>
        <h2 className="text-lg font-semibold mb-4">Choose a Template</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {templates.map((t, i) => (
            <motion.div key={t.id} variants={fadeUp} custom={i + 2}>
              <button className="group w-full cursor-pointer">
                <div
                  className="aspect-[3/4] rounded-xl border-2 border-[var(--border)] group-hover:border-[var(--primary)]/50 transition-all duration-300 overflow-hidden relative"
                >
                  <div className="absolute inset-0 p-3" style={{ background: `${t.color}08` }}>
                    <div className="h-3 w-2/3 rounded-sm mb-2" style={{ background: t.color }} />
                    <div className="h-1.5 w-full rounded-sm bg-[var(--border)] mb-1" />
                    <div className="h-1.5 w-5/6 rounded-sm bg-[var(--border)] mb-1" />
                    <div className="h-1.5 w-4/6 rounded-sm bg-[var(--border)] mb-3" />
                    <div className="h-2 w-1/2 rounded-sm mb-2" style={{ background: `${t.color}60` }} />
                    <div className="h-1.5 w-full rounded-sm bg-[var(--border)] mb-1" />
                    <div className="h-1.5 w-3/4 rounded-sm bg-[var(--border)]" />
                  </div>
                </div>
                <div className="text-xs font-medium mt-2 text-center">{t.name}</div>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Start From Scratch */}
      <motion.div variants={fadeUp} custom={8}>
        <Card className="border-dashed border-2 border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors cursor-pointer">
          <CardContent className="p-8 text-center">
            <Plus className="size-8 text-[var(--muted-foreground)] mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Start from Scratch</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">Build your resume step by step with AI guidance</p>
            <Button variant="glow" className="gap-1.5">
              <Sparkles className="size-4" />
              Create Resume
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
