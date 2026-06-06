"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Search, BookOpen, Sparkles, Globe, Network } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function ResearchPage() {
  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Research Assistant</h1>
        <p className="text-[var(--muted-foreground)]">Research any topic and generate summaries, mind maps, and knowledge graphs.</p>
      </motion.div>

      <motion.div variants={fadeUp} custom={1}>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-3">Research a Topic</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g., Latest trends in AI, Machine learning in healthcare..."
                className="flex-1 h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
              />
              <Button variant="glow" className="gap-1.5 flex-shrink-0">
                <Search className="size-4" />
                Research
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} custom={2}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: BookOpen, label: "Topic Summaries", desc: "AI-generated research summaries with key points" },
            { icon: Network, label: "Mind Maps", desc: "Visual mind maps to explore topic relationships" },
            { icon: Globe, label: "Source Aggregation", desc: "Curated sources from across the web" },
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
