"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Sparkles,
  FileText,
  Brain,
  Mic,
  Target,
  PenTool,
  BarChart3,
  BookOpen,
  Presentation,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Check,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

/* ── Animation Variants ────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

/* ── Module Data ───────────────────────────────────────── */
const modules = [
  {
    icon: Presentation,
    title: "AI Presentations",
    description: "Generate stunning slide decks from prompts, PDFs, YouTube links, or research topics. Export to PPTX, PDF, or Google Slides.",
    color: "oklch(0.7 0.2 270)",
    gradient: "from-purple-500/20 to-blue-500/20",
  },
  {
    icon: FileText,
    title: "Resume Analyzer",
    description: "Get instant ATS scores, keyword analysis, skill gap detection, and actionable improvement recommendations.",
    color: "oklch(0.65 0.2 190)",
    gradient: "from-cyan-500/20 to-teal-500/20",
  },
  {
    icon: PenTool,
    title: "Resume Builder",
    description: "Build professional resumes from scratch with AI assistance. Choose from premium templates and export in any format.",
    color: "oklch(0.7 0.18 150)",
    gradient: "from-emerald-500/20 to-green-500/20",
  },
  {
    icon: Target,
    title: "Job Matching",
    description: "Upload your resume, analyze skills, and get matched with jobs. See match percentages and missing skill recommendations.",
    color: "oklch(0.75 0.16 80)",
    gradient: "from-amber-500/20 to-yellow-500/20",
  },
  {
    icon: Mic,
    title: "Interview Prep",
    description: "Practice mock interviews with AI — technical, HR, behavioral, and coding. Get real-time feedback and confidence scoring.",
    color: "oklch(0.65 0.22 30)",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    icon: Brain,
    title: "Career Copilot",
    description: "AI-generated career roadmaps, learning paths, salary insights, and growth tracking personalized to your goals.",
    color: "oklch(0.65 0.2 310)",
    gradient: "from-pink-500/20 to-rose-500/20",
  },
  {
    icon: BookOpen,
    title: "Document Suite",
    description: "Generate SOPs, cover letters, LORs, LinkedIn summaries, portfolio content, and personal bios with AI.",
    color: "oklch(0.6 0.18 225)",
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
  {
    icon: BarChart3,
    title: "Research Assistant",
    description: "Research topics, generate summaries, create mind maps and knowledge graphs for any subject domain.",
    color: "oklch(0.7 0.15 160)",
    gradient: "from-teal-500/20 to-cyan-500/20",
  },
];

const features = [
  { icon: Zap, label: "Multi-AI Engine", desc: "Groq, Gemini, OpenAI, Claude with automatic fallback" },
  { icon: Shield, label: "Enterprise Security", desc: "JWT, OAuth2, MFA, OWASP Top 10 protection" },
  { icon: Globe, label: "Team Collaboration", desc: "Real-time editing, shared workspaces, activity logs" },
  { icon: BarChart3, label: "Advanced Analytics", desc: "Usage tracking, performance insights, cost monitoring" },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with essential AI tools",
    features: ["5 presentations/month", "3 resume analyses", "Basic templates", "PDF export"],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Everything you need for your career",
    features: [
      "Unlimited presentations",
      "Unlimited resume analyses",
      "AI interview prep",
      "Career copilot",
      "All export formats",
      "Priority AI processing",
      "Premium templates",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    description: "Collaboration for growing teams",
    features: [
      "Everything in Pro",
      "5 team members",
      "Shared workspaces",
      "Real-time collaboration",
      "Team analytics",
      "Admin dashboard",
      "Priority support",
    ],
    cta: "Start Team Plan",
    popular: false,
  },
];

/* ── Page Component ────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <Navbar />

      {/* ━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-dot-pattern opacity-40" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[var(--primary)] opacity-[0.04] blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            className="flex flex-col items-center text-center"
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="mb-6 py-1.5 px-4 gap-1.5 text-sm rounded-full border-[var(--primary)]/30 bg-[var(--primary)]/5">
                <Sparkles className="size-3.5 text-[var(--primary)]" />
                Powered by Multi-AI Engine
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] max-w-5xl"
            >
              Your AI-Powered
              <br />
              <span className="text-gradient">Career Forge</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl leading-relaxed"
            >
              Create presentations, analyze resumes, prepare for interviews, and
              accelerate your career — all in one unified AI platform.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} custom={3} className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Link href="/register">
                <Button variant="glow" size="xl" className="gap-2.5 text-base font-semibold px-8">
                  <Sparkles className="size-5" />
                  Start Building — Free
                </Button>
              </Link>
              <Link href="#modules">
                <Button variant="outline" size="xl" className="gap-2 text-base">
                  Explore Features
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={fadeUp} custom={4} className="mt-12 flex items-center gap-6 text-sm text-[var(--muted-foreground)]">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-[var(--background)] bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/60"
                      style={{ opacity: 1 - i * 0.12 }}
                    />
                  ))}
                </div>
                <span className="ml-2 font-medium">10k+ users</span>
              </div>
              <div className="h-4 w-px bg-[var(--border)]" />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 font-medium">4.9/5</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual — Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-20 mx-auto max-w-5xl"
          >
            <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden">
              {/* Window Controls */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-[var(--muted)] text-xs text-[var(--muted-foreground)]">
                    <Globe className="size-3" />
                    app.forgeai.com/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Preview Content */}
              <div className="p-6 min-h-[350px] bg-gradient-to-br from-[var(--background)] to-[var(--card)]">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-xs text-[var(--muted-foreground)] mb-1">Welcome back</div>
                    <div className="text-lg font-semibold">Dashboard</div>
                  </div>
                  <Button size="sm" variant="glow" className="gap-1.5 text-xs">
                    <Sparkles className="size-3" />
                    New Project
                  </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Presentations", value: "24", icon: Presentation, change: "+3" },
                    { label: "Resumes", value: "8", icon: FileText, change: "+1" },
                    { label: "Interviews", value: "12", icon: Mic, change: "+5" },
                    { label: "ATS Score", value: "92", icon: Target, change: "+7" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3.5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon className="size-4 text-[var(--muted-foreground)]" />
                        <span className="text-xs text-[var(--muted-foreground)]">{stat.label}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{stat.value}</span>
                        <span className="text-xs text-emerald-500 font-medium">{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Items */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <div className="text-sm font-medium mb-3">Recent Activity</div>
                  <div className="space-y-2.5">
                    {[
                      { title: "Q4 Strategy Deck", type: "Presentation", time: "2h ago" },
                      { title: "Senior Dev Resume", type: "Resume Analysis", time: "5h ago" },
                      { title: "Google Mock Interview", type: "Interview", time: "1d ago" },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[var(--accent)] transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium">{item.title}</div>
                          <div className="text-xs text-[var(--muted-foreground)]">{item.type}</div>
                        </div>
                        <span className="text-xs text-[var(--muted-foreground)]">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Glow overlay */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.05] pointer-events-none" />
            </div>
            {/* Reflection */}
            <div className="mx-8 h-20 bg-gradient-to-b from-[var(--primary)]/[0.06] to-transparent rounded-b-3xl blur-sm" />
          </motion.div>
        </div>
      </section>

      {/* ━━ FEATURES STRIP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="features" className="py-20 border-y border-[var(--border)] bg-[var(--card)]/50">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.label}
                variants={scaleIn}
                custom={i}
                className="flex items-start gap-4 p-5 rounded-2xl hover:bg-[var(--accent)]/50 transition-colors duration-300"
              >
                <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                  <feature.icon className="size-5 text-[var(--primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{feature.label}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="modules" className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="mb-4 rounded-full">
                10 Integrated Modules
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need,{" "}
              <span className="text-gradient">one platform</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              From crafting the perfect resume to acing interviews — FORGE AI is your complete career toolkit.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {modules.map((mod, i) => (
              <motion.div key={mod.title} variants={scaleIn} custom={i}>
                <Card className="group h-full border-[var(--border)]/50 hover:border-[var(--primary)]/30 hover:shadow-lg transition-all duration-300 bg-[var(--card)]/80 overflow-hidden">
                  <CardContent className="p-6 relative">
                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${mod.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="relative">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${mod.color}15` }}
                      >
                        <mod.icon
                          className="size-6"
                          style={{ color: mod.color }}
                        />
                      </div>
                      <h3 className="font-semibold text-base mb-2">{mod.title}</h3>
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{mod.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ PRICING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="pricing" className="py-24 md:py-32 bg-[var(--card)]/30">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="mb-4 rounded-full">
                Simple Pricing
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Start free,{" "}
              <span className="text-gradient">scale as you grow</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              No credit card required. Upgrade when you&apos;re ready.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {pricingPlans.map((plan, i) => (
              <motion.div key={plan.name} variants={scaleIn} custom={i}>
                <Card
                  className={`h-full relative overflow-hidden transition-all duration-300 ${
                    plan.popular
                      ? "border-[var(--primary)]/50 shadow-xl glow-sm scale-[1.02]"
                      : "border-[var(--border)]/50 hover:border-[var(--primary)]/20 hover:shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-semibold">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mb-6">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {plan.period}
                      </span>
                    </div>

                    <Link href="/register">
                      <Button
                        variant={plan.popular ? "glow" : "outline"}
                        className="w-full mb-8"
                      >
                        {plan.cta}
                      </Button>
                    </Link>

                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <Check className="size-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-[var(--muted-foreground)]">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Ready to forge your{" "}
              <span className="text-gradient">future?</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-lg text-[var(--muted-foreground)] mb-8 max-w-xl mx-auto">
              Join thousands of professionals using FORGE AI to build their careers and create stunning content.
            </motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Link href="/register">
                <Button variant="glow" size="xl" className="gap-2.5 text-base font-semibold px-10">
                  <Sparkles className="size-5" />
                  Get Started — It&apos;s Free
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
