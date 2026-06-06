"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen, FileText, Mail, Linkedin, UserCheck,
  Sparkles, Plus, X, Copy, Loader2, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

type DocType = {
  icon: React.ElementType;
  label: string;
  desc: string;
  color: string;
  fields: { name: string; placeholder: string; type?: "text" | "textarea" }[];
  systemPrompt: string;
};

const docTypes: DocType[] = [
  {
    icon: Mail,
    label: "Cover Letter",
    desc: "Tailored cover letters for specific job applications",
    color: "oklch(0.7 0.2 270)",
    fields: [
      { name: "jobTitle", placeholder: "Job title (e.g. Senior Engineer)" },
      { name: "company", placeholder: "Company name" },
      { name: "yourName", placeholder: "Your full name" },
      { name: "keySkills", placeholder: "Key skills to highlight", type: "textarea" },
    ],
    systemPrompt: "You are an expert career writer. Write a professional, compelling cover letter that is personalized, specific, and avoids clichés. Use a confident yet genuine tone. Length: 3-4 paragraphs.",
  },
  {
    icon: UserCheck,
    label: "Letter of Recommendation",
    desc: "Draft professional LORs for academic or work purposes",
    color: "oklch(0.65 0.2 190)",
    fields: [
      { name: "candidateName", placeholder: "Candidate's name" },
      { name: "relationship", placeholder: "Your relationship (e.g. Direct Manager)" },
      { name: "purpose", placeholder: "Purpose (e.g. MBA program at Stanford)" },
      { name: "strengths", placeholder: "Key strengths and achievements", type: "textarea" },
    ],
    systemPrompt: "You are writing a professional letter of recommendation. Make it specific, credible, and highlight concrete achievements. Use a formal tone. Length: 3-4 paragraphs.",
  },
  {
    icon: FileText,
    label: "Statement of Purpose",
    desc: "SOPs for graduate school and fellowship applications",
    color: "oklch(0.7 0.18 150)",
    fields: [
      { name: "program", placeholder: "Program (e.g. MS Computer Science)" },
      { name: "university", placeholder: "University name" },
      { name: "background", placeholder: "Academic/professional background" },
      { name: "motivation", placeholder: "Why this program and your research interests", type: "textarea" },
    ],
    systemPrompt: "You are writing a Statement of Purpose for a graduate school application. Make it compelling, specific to the program, and demonstrate clear motivation and fit. Length: 500-700 words.",
  },
  {
    icon: Linkedin,
    label: "LinkedIn Summary",
    desc: "Compelling LinkedIn headline and About section",
    color: "oklch(0.65 0.22 30)",
    fields: [
      { name: "currentRole", placeholder: "Current role and company" },
      { name: "experience", placeholder: "Years of experience and key expertise" },
      { name: "achievements", placeholder: "Top achievements and skills" },
      { name: "goal", placeholder: "Career goal or what you are open to" },
    ],
    systemPrompt: "Write a compelling LinkedIn 'About' section and headline. Use first person, be authentic, include keywords, and end with a clear call to action. Keep it under 300 words.",
  },
  {
    icon: BookOpen,
    label: "Portfolio Content",
    desc: "Project descriptions, case studies, and bios",
    color: "oklch(0.65 0.2 310)",
    fields: [
      { name: "projectName", placeholder: "Project name" },
      { name: "yourRole", placeholder: "Your role" },
      { name: "techStack", placeholder: "Technologies used" },
      { name: "impact", placeholder: "Impact and results achieved", type: "textarea" },
    ],
    systemPrompt: "Write a compelling portfolio project description that highlights the problem solved, your specific contributions, technologies used, and measurable impact. Use active voice. Length: 150-200 words.",
  },
];

function DocModal({
  doc,
  onClose,
}: {
  doc: DocType;
  onClose: () => void;
}) {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: () => {
      const fieldValues = doc.fields
        .map((f) => `${f.placeholder.split("(")[0].trim()}: ${fields[f.name] || "Not provided"}`)
        .join("\n");
      return api.generateAI(`Generate a ${doc.label} with these details:\n\n${fieldValues}`, doc.systemPrompt, 0.75, 1500);
    },
    onSuccess: (res) => {
      if (res.data?.content) setResult(res.data.content);
    },
    onError: () => toast.error("Generation failed. Please try again."),
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${doc.color}15` }}
            >
              <doc.icon className="size-5" style={{ color: doc.color }} />
            </div>
            <div>
              <h3 className="font-semibold">{doc.label}</h3>
              <p className="text-xs text-[var(--muted-foreground)]">{doc.desc}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!result ? (
            <>
              {doc.fields.map((field) => (
                <div key={field.name}>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      placeholder={field.placeholder}
                      value={fields[field.name] ?? ""}
                      onChange={(e) => setFields((f) => ({ ...f, [field.name]: e.target.value }))}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={fields[field.name] ?? ""}
                      onChange={(e) => setFields((f) => ({ ...f, [field.name]: e.target.value }))}
                      className="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                    />
                  )}
                </div>
              ))}
              <Button
                variant="glow"
                className="w-full gap-1.5"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <><Loader2 className="size-4 animate-spin" /> Generating…</>
                ) : (
                  <><Sparkles className="size-4" /> Generate {doc.label}</>
                )}
              </Button>
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">Generated Content</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={handleCopy}>
                    {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setResult(""); generateMutation.reset(); }}>
                    Regenerate
                  </Button>
                </div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {result}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DocumentsPage() {
  const [activeDoc, setActiveDoc] = useState<DocType | null>(null);

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
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 w-full"
                    onClick={() => setActiveDoc(doc)}
                  >
                    <Plus className="size-3.5" />
                    Generate
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {activeDoc && (
          <DocModal doc={activeDoc} onClose={() => setActiveDoc(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
