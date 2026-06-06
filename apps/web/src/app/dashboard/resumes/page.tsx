"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Target, Sparkles, BarChart3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function ResumesPage() {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleUpload = (file: File) => {
    // TODO: Call api.uploadResume(file)
    console.log("Uploading:", file.name);
  };

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
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 mb-4">
            <Upload className="size-7 text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Drop your resume here</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">or click to browse • PDF, DOCX supported</p>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileText className="size-3.5" />
            Browse Files
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
        </div>
      </motion.div>

      {/* What You'll Get */}
      <motion.div variants={fadeUp} custom={2}>
        <h2 className="text-lg font-semibold mb-4">What you&apos;ll get</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Target, label: "ATS Score", desc: "See how your resume performs with applicant tracking systems" },
            { icon: BarChart3, label: "Detailed Analysis", desc: "Content, structure, skills, and tone evaluation" },
            { icon: Sparkles, label: "AI Recommendations", desc: "Actionable tips to improve your resume" },
          ].map((item, i) => (
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
