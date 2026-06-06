"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Search, TrendingUp, Sparkles, BarChart3, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function JobsPage() {
  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Job Matching</h1>
        <p className="text-[var(--muted-foreground)]">Match your resume to job descriptions and identify skill gaps.</p>
      </motion.div>

      {/* Job URL Input */}
      <motion.div variants={fadeUp} custom={1}>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-3">Paste a Job Description</h2>
            <textarea
              rows={5}
              placeholder="Paste the job description here or enter a job URL..."
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none mb-4"
            />
            <Button variant="glow" className="gap-1.5">
              <Target className="size-4" />
              Analyze Match
            </Button>
          </CardContent>
        </Card>
      </motion.div>

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
