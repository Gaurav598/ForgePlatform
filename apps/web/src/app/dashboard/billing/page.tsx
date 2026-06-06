"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, Zap, Crown, Building } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const plans = [
  {
    name: "Free",
    icon: Zap,
    price: "$0",
    period: "forever",
    features: ["5 presentations/month", "3 resume analyses", "Basic templates", "PDF export"],
    current: true,
  },
  {
    name: "Pro",
    icon: Crown,
    price: "$19",
    period: "/month",
    features: [
      "Unlimited presentations",
      "Unlimited resume analyses",
      "AI interview prep",
      "Career copilot",
      "All export formats",
      "Priority AI processing",
      "Premium templates",
    ],
    current: false,
    popular: true,
  },
  {
    name: "Team",
    icon: Building,
    price: "$49",
    period: "/month",
    features: [
      "Everything in Pro",
      "5 team members",
      "Shared workspaces",
      "Real-time collaboration",
      "Team analytics",
      "Admin dashboard",
      "Priority support",
    ],
    current: false,
  },
];

export default function BillingPage() {
  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Billing</h1>
        <p className="text-[var(--muted-foreground)]">Manage your subscription and payment methods.</p>
      </motion.div>

      {/* Current Plan */}
      <motion.div variants={fadeUp} custom={1}>
        <Card className="border-[var(--primary)]/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
                <Zap className="size-6 text-[var(--primary)]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Free Plan</h3>
                  <Badge variant="outline">Current</Badge>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">5 presentations & 3 analyses per month</p>
              </div>
            </div>
            <Button variant="glow">Upgrade</Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Comparison */}
      <motion.div variants={fadeUp} custom={2}>
        <h2 className="text-lg font-semibold mb-4">Compare Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} variants={fadeUp} custom={i + 3}>
              <Card className={`h-full relative ${plan.popular ? "border-[var(--primary)]/50 shadow-lg" : ""}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-semibold">
                    Popular
                  </div>
                )}
                <CardContent className="p-6">
                  <plan.icon className="size-6 text-[var(--primary)] mb-3" />
                  <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-[var(--muted-foreground)]">{plan.period}</span>
                  </div>
                  <Button
                    variant={plan.current ? "outline" : plan.popular ? "glow" : "default"}
                    className="w-full mb-4"
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </Button>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="size-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                        <span className="text-[var(--muted-foreground)]">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
