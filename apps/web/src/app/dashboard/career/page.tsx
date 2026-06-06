"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain, TrendingUp, BookOpen, Target, GraduationCap, DollarSign, Sparkles, ArrowRight, Lightbulb, Map,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const copilotFeatures = [
  { icon: Map, label: "Career Roadmap", desc: "AI-generated step-by-step path to your dream role", gradient: "from-purple-500/10 to-blue-500/10" },
  { icon: BookOpen, label: "Learning Paths", desc: "Curated courses and resources for skill development", gradient: "from-cyan-500/10 to-teal-500/10" },
  { icon: DollarSign, label: "Salary Insights", desc: "Market salary data based on role, location, and experience", gradient: "from-emerald-500/10 to-green-500/10" },
  { icon: TrendingUp, label: "Growth Tracker", desc: "Track your progress against career milestones", gradient: "from-amber-500/10 to-yellow-500/10" },
  { icon: Target, label: "Skill Gap Analysis", desc: "Identify missing skills for your target role", gradient: "from-orange-500/10 to-red-500/10" },
  { icon: GraduationCap, label: "Certification Guide", desc: "Recommended certifications for career advancement", gradient: "from-pink-500/10 to-rose-500/10" },
];

export default function CareerPage() {
  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Career Copilot</h1>
        <p className="text-[var(--muted-foreground)]">AI-powered career intelligence and growth planning.</p>
      </motion.div>

      {/* Get Started Card */}
      <motion.div variants={fadeUp} custom={1}>
        <Card className="border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-transparent">
          <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10 flex-shrink-0">
              <Brain className="size-7 text-[var(--primary)]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">Start Your Career Journey</h2>
              <p className="text-[var(--muted-foreground)] text-sm">
                Tell us about your current role, experience level, and career goals. Our AI will create a personalized roadmap.
              </p>
            </div>
            <Button variant="glow" className="gap-1.5 flex-shrink-0">
              <Sparkles className="size-4" />
              Begin Assessment
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Grid */}
      <motion.div variants={fadeUp} custom={2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {copilotFeatures.map((feature, i) => (
            <motion.div key={feature.label} variants={fadeUp} custom={i + 3}>
              <Card className="group h-full cursor-pointer hover:shadow-md hover:border-[var(--primary)]/20 transition-all overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative">
                    <feature.icon className="size-6 text-[var(--primary)] mb-3" />
                    <div className="font-semibold text-sm mb-1">{feature.label}</div>
                    <div className="text-xs text-[var(--muted-foreground)] leading-relaxed">{feature.desc}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
