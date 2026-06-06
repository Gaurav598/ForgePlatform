"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Plus, Minus, CheckCircle2,
  Sparkles, User, Briefcase, GraduationCap, Code, ArrowRight,
  ArrowLeft, Loader2, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const templates = [
  { id: "classic",   label: "Classic",   desc: "Clean, traditional layout ideal for conservative industries",  tags: ["Corporate", "Finance", "Law"] },
  { id: "modern",    label: "Modern",    desc: "Contemporary design for tech and startup roles",                tags: ["Tech", "Startups", "Product"] },
  { id: "creative",  label: "Creative",  desc: "Standout layout for design and marketing professionals",        tags: ["Design", "Marketing", "Media"] },
  { id: "executive", label: "Executive", desc: "Premium format for senior leadership roles",                   tags: ["C-Suite", "Director", "VP"] },
  { id: "minimal",   label: "Minimal",   desc: "Ultra-clean, ATS-friendly one-pager",                          tags: ["ATS", "All Industries"] },
  { id: "academic",  label: "Academic",  desc: "CV-style format for research and academia",                    tags: ["Research", "PhD", "Academia"] },
];

type Step = "template" | "personal" | "experience" | "education" | "skills" | "review";

const steps: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "template",   label: "Template",     icon: FileText },
  { id: "personal",   label: "Personal Info", icon: User },
  { id: "experience", label: "Experience",    icon: Briefcase },
  { id: "education",  label: "Education",     icon: GraduationCap },
  { id: "skills",     label: "Skills",        icon: Code },
  { id: "review",     label: "Review",        icon: CheckCircle2 },
];

const stepOrder: Step[] = ["template", "personal", "experience", "education", "skills", "review"];

interface WorkExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string;
}

interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  year: string;
  gpa: string;
}

/* ── Input helper ───────────────────────────────────────── */
function Field({
  placeholder, value, onChange, type = "text", className = "",
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm
        placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2
        focus:ring-[var(--ring)] transition-all ${className}`}
    />
  );
}

/* ── Page ───────────────────────────────────────────────── */
export default function ResumeBuilderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState<Step>("template");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  /* Personal Info */
  const [personal, setPersonal] = useState({
    name: "", email: "", phone: "", location: "", linkedin: "", portfolio: "", summary: "",
  });

  /* Experience */
  const [experiences, setExperiences] = useState<WorkExperience[]>([
    { company: "", role: "", startDate: "", endDate: "", current: false, bullets: "" },
  ]);

  /* Education */
  const [educations, setEducations] = useState<EducationEntry[]>([
    { institution: "", degree: "", field: "", year: "", gpa: "" },
  ]);

  /* Skills */
  const [skills, setSkills] = useState("");

  /* ── Validation helpers ──────────────────────────────── */
  const canProceedFromTemplate = !!selectedTemplate;
  const canProceedFromPersonal = personal.name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email);
  const reviewErrors: string[] = [];
  if (!selectedTemplate) reviewErrors.push("No template selected");
  if (!personal.name.trim()) reviewErrors.push("Full name is required");
  if (!personal.email.trim()) reviewErrors.push("Email address is required");

  /* ── Save mutation ───────────────────────────────────── */
  const saveMutation = useMutation({
    /**
     * Calls api.createBuilderResume() which serializes the structured form data
     * to a JSON blob and POSTs it to POST /api/v1/resumes/upload (multipart).
     * The backend saves file metadata only — it never reads file content —
     * so this is correct per the existing backend contract.
     */
    mutationFn: () =>
      api.createBuilderResume({
        template: selectedTemplate!,
        personal,
        experiences: experiences.filter((e) => e.company.trim() || e.role.trim()),
        educations: educations.filter((e) => e.institution.trim()),
        skills,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["resumes-count"] });
      toast.success("Resume saved!", {
        description: `"${res.data?.title ?? "Your resume"}" is ready to analyze.`,
      });
      router.push("/dashboard/resumes");
    },
    onError: (err) => {
      toast.error("Failed to save resume", {
        description: err instanceof Error ? err.message : "Unknown error. Please try again.",
      });
    },
  });

  /* ── Step navigation ─────────────────────────────────── */
  const currentIdx = stepOrder.indexOf(currentStep);

  const nextStep = () => {
    if (currentStep === "template" && !canProceedFromTemplate) {
      toast.warning("Select a template first.");
      return;
    }
    if (currentStep === "personal" && !canProceedFromPersonal) {
      toast.warning("Full name and a valid email are required.");
      return;
    }
    if (currentIdx < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIdx + 1]);
    }
  };

  const prevStep = () => {
    if (currentIdx > 0) setCurrentStep(stepOrder[currentIdx - 1]);
  };

  /* ── Experience helpers ──────────────────────────────── */
  const updateExp = (i: number, patch: Partial<WorkExperience>) =>
    setExperiences((prev) => prev.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addExp = () =>
    setExperiences((p) => [...p, { company: "", role: "", startDate: "", endDate: "", current: false, bullets: "" }]);
  const removeExp = (i: number) =>
    setExperiences((p) => p.filter((_, j) => j !== i));

  /* ── Education helpers ───────────────────────────────── */
  const updateEdu = (i: number, patch: Partial<EducationEntry>) =>
    setEducations((prev) => prev.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addEdu = () =>
    setEducations((p) => [...p, { institution: "", degree: "", field: "", year: "", gpa: "" }]);
  const removeEdu = (i: number) =>
    setEducations((p) => p.filter((_, j) => j !== i));

  /* ── Render ──────────────────────────────────────────── */
  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">

      {/* Header */}
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Resume Builder</h1>
        <p className="text-[var(--muted-foreground)]">
          Build a professional resume with guided sections and AI-ready templates.
        </p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div variants={fadeUp} custom={1}>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  if (i <= currentIdx || selectedTemplate) setCurrentStep(s.id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  currentStep === s.id
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : i < currentIdx
                    ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                    : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                }`}
              >
                {i < currentIdx ? <CheckCircle2 className="size-3.5" /> : <s.icon className="size-3.5" />}
                {s.label}
              </button>
              {i < steps.length - 1 && <div className="h-px w-4 bg-[var(--border)]" />}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >

          {/* ── TEMPLATE SELECTION ─────────────────────── */}
          {currentStep === "template" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((t) => (
                <Card
                  key={t.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                    selectedTemplate === t.id
                      ? "border-[var(--primary)] shadow-md ring-2 ring-[var(--primary)]/20"
                      : "hover:border-[var(--primary)]/30"
                  }`}
                  onClick={() => setSelectedTemplate(t.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                        <FileText className="size-5 text-[var(--primary)]" />
                      </div>
                      {selectedTemplate === t.id && (
                        <CheckCircle2 className="size-5 text-[var(--primary)]" />
                      )}
                    </div>
                    <div className="font-semibold text-sm mb-1">{t.label}</div>
                    <div className="text-xs text-[var(--muted-foreground)] mb-3">{t.desc}</div>
                    <div className="flex flex-wrap gap-1">
                      {t.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs py-0">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ── PERSONAL INFO ──────────────────────────── */}
          {currentStep === "personal" && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <User className="size-5 text-[var(--primary)]" /> Personal Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <Field
                      placeholder="Full Name *"
                      value={personal.name}
                      onChange={(v) => setPersonal((p) => ({ ...p, name: v }))}
                    />
                    {personal.name && personal.name.trim().length < 2 && (
                      <p className="text-xs text-[var(--destructive)] flex items-center gap-1">
                        <AlertCircle className="size-3" /> At least 2 characters required
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Field
                      placeholder="Email Address *"
                      type="email"
                      value={personal.email}
                      onChange={(v) => setPersonal((p) => ({ ...p, email: v }))}
                    />
                    {personal.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email) && (
                      <p className="text-xs text-[var(--destructive)] flex items-center gap-1">
                        <AlertCircle className="size-3" /> Enter a valid email
                      </p>
                    )}
                  </div>
                  <Field placeholder="Phone Number" value={personal.phone} onChange={(v) => setPersonal((p) => ({ ...p, phone: v }))} />
                  <Field placeholder="Location (City, Country)" value={personal.location} onChange={(v) => setPersonal((p) => ({ ...p, location: v }))} />
                  <Field placeholder="LinkedIn URL" type="url" value={personal.linkedin} onChange={(v) => setPersonal((p) => ({ ...p, linkedin: v }))} />
                  <Field placeholder="Portfolio / GitHub URL" type="url" value={personal.portfolio} onChange={(v) => setPersonal((p) => ({ ...p, portfolio: v }))} />
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium mb-1.5 block">Professional Summary</label>
                  <textarea
                    rows={4}
                    placeholder="Write a 2–3 sentence professional summary highlighting your experience and value proposition…"
                    value={personal.summary}
                    onChange={(e) => setPersonal((p) => ({ ...p, summary: e.target.value }))}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm
                      placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2
                      focus:ring-[var(--ring)] transition-all resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── EXPERIENCE ─────────────────────────────── */}
          {currentStep === "experience" && (
            <div className="space-y-4">
              {experiences.map((exp, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        <Briefcase className="size-4 text-[var(--primary)]" />
                        Position {i + 1}
                        {exp.company && <span className="text-[var(--muted-foreground)] font-normal">— {exp.company}</span>}
                      </h3>
                      {experiences.length > 1 && (
                        <Button
                          size="icon" variant="ghost"
                          className="h-7 w-7 text-[var(--muted-foreground)] hover:text-red-500"
                          onClick={() => removeExp(i)}
                          title="Remove this position"
                        >
                          <Minus className="size-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field placeholder="Company Name" value={exp.company} onChange={(v) => updateExp(i, { company: v })} />
                      <Field placeholder="Job Title / Role" value={exp.role} onChange={(v) => updateExp(i, { role: v })} />
                      <Field placeholder="Start Date (e.g. Jan 2022)" value={exp.startDate} onChange={(v) => updateExp(i, { startDate: v })} />
                      <Field placeholder="End Date (or leave blank for current)" value={exp.endDate} onChange={(v) => updateExp(i, { endDate: v })} />
                    </div>
                    <div className="flex items-center gap-2 mt-3 mb-2">
                      <input
                        id={`current-${i}`}
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateExp(i, { current: e.target.checked, endDate: e.target.checked ? "" : exp.endDate })}
                        className="rounded"
                      />
                      <label htmlFor={`current-${i}`} className="text-xs text-[var(--muted-foreground)] cursor-pointer">
                        I currently work here
                      </label>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Key achievements and responsibilities (one per line, start with action verbs like 'Led', 'Built', 'Improved')…"
                      value={exp.bullets}
                      onChange={(e) => updateExp(i, { bullets: e.target.value })}
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm
                        placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2
                        focus:ring-[var(--ring)] transition-all resize-none"
                    />
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="gap-1.5 w-full" onClick={addExp}>
                <Plus className="size-4" /> Add Another Position
              </Button>
            </div>
          )}

          {/* ── EDUCATION ──────────────────────────────── */}
          {currentStep === "education" && (
            <div className="space-y-4">
              {educations.map((edu, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        <GraduationCap className="size-4 text-[var(--primary)]" />
                        Education {i + 1}
                        {edu.institution && <span className="text-[var(--muted-foreground)] font-normal">— {edu.institution}</span>}
                      </h3>
                      {educations.length > 1 && (
                        <Button
                          size="icon" variant="ghost"
                          className="h-7 w-7 text-[var(--muted-foreground)] hover:text-red-500"
                          onClick={() => removeEdu(i)}
                          title="Remove this entry"
                        >
                          <Minus className="size-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                        <Field placeholder="University / Institution" value={edu.institution} onChange={(v) => updateEdu(i, { institution: v })} />
                      </div>
                      <Field placeholder="Degree (e.g. Bachelor's)" value={edu.degree} onChange={(v) => updateEdu(i, { degree: v })} />
                      <Field placeholder="Field of Study" value={edu.field} onChange={(v) => updateEdu(i, { field: v })} />
                      <Field placeholder="Graduation Year" value={edu.year} onChange={(v) => updateEdu(i, { year: v })} />
                      <Field placeholder="GPA (optional)" value={edu.gpa} onChange={(v) => updateEdu(i, { gpa: v })} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="gap-1.5 w-full" onClick={addEdu}>
                <Plus className="size-4" /> Add Another Entry
              </Button>
            </div>
          )}

          {/* ── SKILLS ─────────────────────────────────── */}
          {currentStep === "skills" && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Code className="size-5 text-[var(--primary)]" /> Skills
                </h2>
                <label className="text-sm font-medium mb-1.5 block">Technical &amp; Soft Skills</label>
                <textarea
                  rows={8}
                  placeholder={`List your skills, tools, and technologies. Separate by commas or line breaks.\n\ne.g., React, Node.js, Python, SQL, System Design, AWS, Team Leadership, Agile/Scrum…`}
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm
                    placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2
                    focus:ring-[var(--ring)] transition-all resize-none"
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  Tip: Include both technical and soft skills. Match keywords from your target job descriptions for higher ATS scores.
                </p>
              </CardContent>
            </Card>
          )}

          {/* ── REVIEW ─────────────────────────────────── */}
          {currentStep === "review" && (
            <Card className="border-[var(--primary)]/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle2 className="size-5 text-emerald-500" />
                  <h2 className="font-semibold text-lg">Review Your Resume</h2>
                </div>

                {/* Validation errors */}
                {reviewErrors.length > 0 && (
                  <div className="mb-5 p-3 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/20">
                    <p className="text-sm font-medium text-[var(--destructive)] mb-1 flex items-center gap-1.5">
                      <AlertCircle className="size-4" /> Please fix the following before saving:
                    </p>
                    <ul className="space-y-1">
                      {reviewErrors.map((e) => (
                        <li key={e} className="text-xs text-[var(--destructive)]">• {e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-4 text-sm">
                  {/* Template + Identity */}
                  <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                    <div className="font-medium mb-2">
                      Template:{" "}
                      <Badge variant="outline" className="capitalize ml-1">{selectedTemplate ?? "—"}</Badge>
                    </div>
                    <div className="text-[var(--muted-foreground)] text-xs space-y-0.5">
                      <div>{personal.name || <span className="text-[var(--destructive)]">Name not set</span>}</div>
                      <div>{personal.email || <span className="text-[var(--destructive)]">Email not set</span>}</div>
                      {personal.phone && <div>{personal.phone}</div>}
                      {personal.location && <div>{personal.location}</div>}
                      {personal.linkedin && <div className="truncate">{personal.linkedin}</div>}
                    </div>
                  </div>

                  {/* Summary */}
                  {personal.summary && (
                    <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                      <div className="font-medium mb-1">Professional Summary</div>
                      <div className="text-[var(--muted-foreground)] text-xs leading-relaxed">{personal.summary}</div>
                    </div>
                  )}

                  {/* Experience */}
                  <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                    <div className="font-medium mb-1">
                      Experience ({experiences.filter((e) => e.company).length} positions)
                    </div>
                    <div className="text-[var(--muted-foreground)] text-xs">
                      {experiences.filter((e) => e.company).map((e) => `${e.role} @ ${e.company}`).join(" · ") || "None added"}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                    <div className="font-medium mb-1">
                      Education ({educations.filter((e) => e.institution).length} entries)
                    </div>
                    <div className="text-[var(--muted-foreground)] text-xs">
                      {educations.filter((e) => e.institution).map((e) => `${e.degree} in ${e.field} — ${e.institution}`).join(" · ") || "None added"}
                    </div>
                  </div>

                  {/* Skills */}
                  {skills && (
                    <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                      <div className="font-medium mb-1">Skills</div>
                      <div className="text-[var(--muted-foreground)] text-xs line-clamp-3">{skills}</div>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <Button
                  variant="glow"
                  className="w-full gap-1.5 mt-6"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || reviewErrors.length > 0}
                >
                  {saveMutation.isPending ? (
                    <><Loader2 className="size-4 animate-spin" /> Saving Resume…</>
                  ) : (
                    <><Sparkles className="size-4" /> Save &amp; Go to Analyzer</>
                  )}
                </Button>

                <p className="text-xs text-center text-[var(--muted-foreground)] mt-3">
                  Your resume data is saved and you can run an AI analysis immediately after.
                </p>
              </CardContent>
            </Card>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          className="gap-1.5"
          onClick={prevStep}
          disabled={currentIdx === 0}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>

        {currentStep !== "review" && (
          <Button variant="glow" className="gap-1.5" onClick={nextStep}>
            Next <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
