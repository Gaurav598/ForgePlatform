"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Mail, Linkedin, UserCheck, Sparkles, Plus } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const docTypes = [
  { icon: Mail, label: "Cover Letter", desc: "Tailored cover letters for specific job applications", color: "oklch(0.7 0.2 270)" },
  { icon: UserCheck, label: "Letter of Recommendation", desc: "Draft professional LORs for academic or work purposes", color: "oklch(0.65 0.2 190)" },
  { icon: FileText, label: "Statement of Purpose", desc: "SOPs for graduate school and fellowship applications", color: "oklch(0.7 0.18 150)" },
  { icon: Linkedin, label: "LinkedIn Summary", desc: "Compelling LinkedIn headline and About section", color: "oklch(0.65 0.22 30)" },
  { icon: BookOpen, label: "Portfolio Content", desc: "Project descriptions, case studies, and bios", color: "oklch(0.65 0.2 310)" },
];

export default function DocumentsPage() {
  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Document Suite</h1>
        <p className="text-[var(--muted-foreground)]">Generate professional documents with AI assistance.</p>
      </motion.div>

      <motion.div variants={fadeUp} custom={1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docTypes.map((doc, i) => (
            <motion.div key={doc.label} variants={fadeUp} custom={i + 2}>
              <Card className="group cursor-pointer hover:shadow-md hover:border-[var(--primary)]/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${doc.color}15` }}
                  >
                    <doc.icon className="size-6" style={{ color: doc.color }} />
                  </div>
                  <div className="font-semibold text-sm mb-1">{doc.label}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mb-4">{doc.desc}</div>
                  <Button size="sm" variant="outline" className="gap-1.5 w-full">
                    <Plus className="size-3.5" />
                    Generate
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
