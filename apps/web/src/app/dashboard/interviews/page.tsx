"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Brain, Video, MessageSquare, Sparkles, ArrowRight, Code, Users, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const interviewTypes = [
  { id: "technical", icon: Code, label: "Technical", desc: "DSA, system design, and coding challenges", color: "oklch(0.7 0.2 270)" },
  { id: "behavioral", icon: Users, label: "Behavioral", desc: "STAR method, leadership, and teamwork scenarios", color: "oklch(0.65 0.2 190)" },
  { id: "hr", icon: Briefcase, label: "HR Round", desc: "Salary negotiation, culture fit, and expectations", color: "oklch(0.75 0.16 80)" },
  { id: "case", icon: Brain, label: "Case Study", desc: "Problem-solving, analytics, and strategy", color: "oklch(0.65 0.22 30)" },
];

export default function InterviewsPage() {
  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Interview Prep</h1>
        <p className="text-[var(--muted-foreground)]">Practice mock interviews with AI and get real-time feedback.</p>
      </motion.div>

      {/* Interview Types */}
      <motion.div variants={fadeUp} custom={1}>
        <h2 className="text-lg font-semibold mb-4">Choose Interview Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {interviewTypes.map((type, i) => (
            <motion.div key={type.id} variants={fadeUp} custom={i + 2}>
              <Card className="group cursor-pointer hover:shadow-md hover:border-[var(--primary)]/30 transition-all duration-300">
                <CardContent className="p-6 flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${type.color}15` }}
                  >
                    <type.icon className="size-6" style={{ color: type.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{type.label}</div>
                    <div className="text-sm text-[var(--muted-foreground)] mb-3">{type.desc}</div>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      Start Practice
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features */}
      <motion.div variants={fadeUp} custom={6} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Video, label: "Video Mode", desc: "Practice with webcam for body language analysis" },
          { icon: MessageSquare, label: "Real-time Feedback", desc: "Get instant scoring on each answer" },
          { icon: Brain, label: "AI Confidence Score", desc: "Track your improvement over time" },
        ].map((f) => (
          <Card key={f.label}>
            <CardContent className="p-5 text-center">
              <f.icon className="size-6 text-[var(--primary)] mx-auto mb-2" />
              <div className="font-semibold text-sm mb-1">{f.label}</div>
              <div className="text-xs text-[var(--muted-foreground)]">{f.desc}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  );
}
