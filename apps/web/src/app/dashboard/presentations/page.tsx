"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Presentation, Plus, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

export default function PresentationsPage() {
  return (
    <motion.div className="max-w-7xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Presentations</h1>
          <p className="text-[var(--muted-foreground)]">AI-generated slide decks from any source.</p>
        </div>
        <Link href="/dashboard/presentations/new">
          <Button variant="glow" className="gap-1.5">
            <Plus className="size-4" />
            New Presentation
          </Button>
        </Link>
      </motion.div>

      {/* Empty State */}
      <motion.div variants={fadeUp} custom={1}>
        <Card>
          <CardContent className="p-16 text-center">
            <Presentation className="size-12 text-[var(--muted-foreground)] mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-semibold mb-2">No presentations yet</h3>
            <p className="text-[var(--muted-foreground)] text-sm mb-6 max-w-md mx-auto">
              Create your first AI-powered presentation. Generate from a prompt, upload a PDF, or paste a YouTube link.
            </p>
            <Link href="/dashboard/presentations/new">
              <Button variant="glow" className="gap-1.5">
                <Sparkles className="size-4" />
                Create First Presentation
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
