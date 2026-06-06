"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Presentation,
  FileText,
  Mic,
  Target,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stats = [
  {
    label: "Presentations",
    value: "0",
    change: "Create your first",
    icon: Presentation,
    href: "/dashboard/presentations",
    color: "oklch(0.7 0.2 270)",
  },
  {
    label: "Resumes Analyzed",
    value: "0",
    change: "Upload a resume",
    icon: FileText,
    href: "/dashboard/resumes",
    color: "oklch(0.65 0.2 190)",
  },
  {
    label: "Mock Interviews",
    value: "0",
    change: "Start practicing",
    icon: Mic,
    href: "/dashboard/interviews",
    color: "oklch(0.65 0.22 30)",
  },
  {
    label: "ATS Score",
    value: "—",
    change: "Analyze to see",
    icon: Target,
    href: "/dashboard/resumes",
    color: "oklch(0.75 0.16 80)",
  },
];

const quickActions = [
  {
    icon: Presentation,
    label: "Create Presentation",
    desc: "Generate slides from any prompt",
    href: "/dashboard/presentations/new",
    gradient: "from-purple-500/10 to-blue-500/10",
  },
  {
    icon: FileText,
    label: "Analyze Resume",
    desc: "Get your ATS score instantly",
    href: "/dashboard/resumes/upload",
    gradient: "from-cyan-500/10 to-teal-500/10",
  },
  {
    icon: Mic,
    label: "Mock Interview",
    desc: "Practice with AI interviewer",
    href: "/dashboard/interviews/new",
    gradient: "from-orange-500/10 to-red-500/10",
  },
  {
    icon: Sparkles,
    label: "Generate Document",
    desc: "SOP, Cover Letter, LOR & more",
    href: "/dashboard/documents/new",
    gradient: "from-pink-500/10 to-rose-500/10",
  },
];

export default function DashboardPage() {
  return (
    <motion.div
      className="space-y-8 max-w-7xl"
      initial="hidden"
      animate="visible"
    >
      {/* Welcome */}
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Welcome to FORGE AI</h1>
        <p className="text-[var(--muted-foreground)]">
          Your unified AI workspace for career growth and content creation.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} variants={fadeUp} custom={i + 1}>
            <Link href={stat.href}>
              <Card className="group hover:shadow-md hover:border-[var(--primary)]/20 transition-all duration-300 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <stat.icon className="size-5" style={{ color: stat.color }} />
                    </div>
                    <ArrowUpRight className="size-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                  </div>
                  <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{stat.label}</div>
                  <div className="text-xs text-[var(--primary)] mt-1.5 font-medium">{stat.change}</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} custom={5}>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.div key={action.label} variants={fadeUp} custom={i + 6}>
              <Link href={action.href}>
                <Card className="group h-full hover:shadow-md hover:border-[var(--primary)]/20 transition-all duration-300 cursor-pointer overflow-hidden">
                  <CardContent className="p-5 relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/15 transition-colors">
                          <action.icon className="size-5 text-[var(--primary)]" />
                        </div>
                        <Plus className="size-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors ml-auto" />
                      </div>
                      <div className="font-semibold text-sm mb-1">{action.label}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{action.desc}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity — Placeholder */}
      <motion.div variants={fadeUp} custom={10}>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="size-10 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
            <p className="text-[var(--muted-foreground)] text-sm mb-4">
              No activity yet. Start by creating a presentation or analyzing a resume.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/dashboard/presentations/new">
                <Button size="sm" variant="glow" className="gap-1.5">
                  <Sparkles className="size-3.5" />
                  Create Presentation
                </Button>
              </Link>
              <Link href="/dashboard/resumes/upload">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <FileText className="size-3.5" />
                  Analyze Resume
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
