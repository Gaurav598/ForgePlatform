"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard, Sparkles, Zap, Building2, CheckCircle2,
  TrendingUp, Lock, HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const plans = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    period: "/month",
    icon: Sparkles,
    desc: "Get started with AI tools",
    color: "oklch(0.65 0.2 190)",
    features: [
      "5 presentations/month",
      "3 resume analyses/month",
      "Basic interview prep (10 sessions)",
      "Research assistant",
      "Document generator",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$19",
    period: "/month",
    icon: Zap,
    desc: "For individuals serious about their career",
    color: "oklch(0.7 0.2 270)",
    popular: true,
    features: [
      "Unlimited presentations",
      "Unlimited resume analyses",
      "Full interview prep library",
      "Career Copilot with roadmap",
      "All document types",
      "Priority AI generation",
      "Export to PDF & DOCX",
    ],
  },
  {
    id: "TEAM",
    name: "Team",
    price: "$49",
    period: "/month",
    icon: Building2,
    desc: "For teams and organizations",
    color: "oklch(0.65 0.22 30)",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Team analytics dashboard",
      "Shared template library",
      "Admin controls",
      "Priority support",
      "Custom branding",
    ],
  },
];

const usageStats = [
  { label: "Presentations", used: 2, limit: 5 },
  { label: "Resume Analyses", used: 1, limit: 3 },
  { label: "Interview Sessions", used: 3, limit: 10 },
];

export default function BillingPage() {
  const { user } = useAuthStore();
  const currentPlan = user?.plan ?? "FREE";

  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Billing & Plans</h1>
        <p className="text-[var(--muted-foreground)]">Manage your subscription and view usage.</p>
      </motion.div>

      {/* Current Plan Banner */}
      <motion.div variants={fadeUp} custom={1}>
        <Card className="border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-transparent">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)]/10 flex-shrink-0">
              <CreditCard className="size-6 text-[var(--primary)]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-lg">Current Plan</h2>
                <Badge className="capitalize">{currentPlan.toLowerCase()}</Badge>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {currentPlan === "FREE"
                  ? "You are on the Free plan. Upgrade to unlock unlimited AI generation."
                  : currentPlan === "PRO"
                  ? "You have unlimited access to all Pro features."
                  : "Team plan — collaborate with your team members."}
              </p>
            </div>
            {currentPlan === "FREE" && (
              <Button variant="glow" className="gap-1.5 flex-shrink-0" onClick={() => toast.info("Upgrade flow coming soon — Stripe integration in progress.")}>
                <Zap className="size-4" />
                Upgrade to Pro
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Usage (Free plan only) */}
      {currentPlan === "FREE" && (
        <motion.div variants={fadeUp} custom={2}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="size-5 text-[var(--primary)]" /> Monthly Usage
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {usageStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{stat.label}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">{stat.used}/{stat.limit}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--muted)]">
                    <div
                      className="h-1.5 rounded-full bg-[var(--primary)] transition-all duration-700"
                      style={{ width: `${(stat.used / stat.limit) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1.5">
                    {stat.limit - stat.used} remaining
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Plans */}
      <motion.div variants={fadeUp} custom={3}>
        <h2 className="text-lg font-semibold mb-4">All Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((plan, i) => {
            const isCurrent = plan.id === currentPlan;
            return (
              <motion.div key={plan.id} variants={fadeUp} custom={i + 4}>
                <Card
                  className={`h-full flex flex-col relative overflow-hidden transition-all ${
                    isCurrent
                      ? "border-[var(--primary)] shadow-md ring-2 ring-[var(--primary)]/20"
                      : plan.popular
                      ? "border-[var(--primary)]/30"
                      : ""
                  }`}
                >
                  {plan.popular && !isCurrent && (
                    <div className="absolute top-3 right-3">
                      <Badge className="text-xs bg-[var(--primary)] text-[var(--primary-foreground)]">Most Popular</Badge>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute top-3 right-3">
                      <Badge className="text-xs bg-emerald-500/15 text-emerald-600 border-emerald-500/20">Current</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col h-full">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl mb-4"
                      style={{ backgroundColor: `${plan.color}15` }}
                    >
                      <plan.icon className="size-5" style={{ color: plan.color }} />
                    </div>
                    <div className="font-bold text-xl">{plan.name}</div>
                    <div className="flex items-baseline gap-1 my-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-sm text-[var(--muted-foreground)]">{plan.period}</span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-4">{plan.desc}</p>
                    <ul className="space-y-2 mb-6 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="size-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-[var(--muted-foreground)]">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={isCurrent ? "outline" : "glow"}
                      className="w-full"
                      disabled={isCurrent}
                      onClick={() => !isCurrent && toast.info("Stripe integration in progress. Coming soon!")}
                    >
                      {isCurrent ? "Current Plan" : `Upgrade to ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div variants={fadeUp} custom={7}>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <HelpCircle className="size-5 text-[var(--primary)]" /> Frequently Asked
            </h2>
            <div className="space-y-4">
              {[
                { q: "Can I cancel anytime?", a: "Yes. Cancel your subscription at any time from this page. You'll keep access until the end of your billing period." },
                { q: "What payment methods are accepted?", a: "We accept all major credit/debit cards via Stripe. Bank transfers available for Enterprise plans." },
                { q: "Is there a free trial?", a: "All users start on the Free plan with no credit card required. Upgrade anytime to unlock unlimited features." },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-[var(--border)] last:border-0 pb-4 last:pb-0">
                  <div className="font-medium text-sm mb-1">{q}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{a}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Note */}
      <motion.div variants={fadeUp} custom={8}>
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] justify-center">
          <Lock className="size-3.5" />
          Payments secured by Stripe. We never store your card details.
        </div>
      </motion.div>
    </motion.div>
  );
}
