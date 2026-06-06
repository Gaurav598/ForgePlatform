"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PenTool, FileText, Plus, Minus, Upload, CheckCircle2,
  Sparkles, User, Briefcase, GraduationCap, Code, ArrowRight,
  ArrowLeft, Loader2,
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
  { id: "classic", label: "Classic", desc: "Clean, traditional layout ideal for conservative industries", tags: ["Corporate", "Finance", "Law"] },
  { id: "modern", label: "Modern", desc: "Contemporary design for tech and startup roles", tags: ["Tech", "Startups", "Product"] },
  { id: "creative", label: "Creative", desc: "Standout layout for design and marketing professionals", tags: ["Design", "Marketing", "Media"] },
  { id: "executive", label: "Executive", desc: "Premium format for senior leadership roles", tags: ["C-Suite", "Director", "VP"] },
  { id: "minimal", label: "Minimal", desc: "Ultra-clean, ATS-friendly one-pager", tags: ["ATS", "All Industries"] },
  { id: "academic", label: "Academic", desc: "CV-style format for research and academia", tags: ["Research", "PhD", "Academia"] },
];

type Step = "template" | "personal" | "experience" | "education" | "skills" | "review";

const steps: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "template", label: "Template", icon: FileText },
  { id: "personal", label: "Personal Info", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Code },
  { id: "review", label: "Review", icon: CheckCircle2 },
];

const stepOrder: Step[] = ["template", "personal", "experience", "education", "skills", "review"];

interface WorkExperience { company: string; role: string; startDate: string; endDate: string; current: boolean; bullets: string; }
interface EducationEntry { institution: string; degree: string; field: string; year: string; gpa: string; }

export default function ResumeBuilderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState<Step>("template");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Personal Info
  const [personal, setPersonal] = useState({
    name: "", email: "", phone: "", location: "", linkedin: "", portfolio: "", summary: "",
  });

  // Experience
  const [experiences, setExperiences] = useState<WorkExperience[]>([
    { company: "", role: "", startDate: "", endDate: "", current: false, bullets: "" },
  ]);

  // Education
  const [educations, setEducations] = useState<EducationEntry[]>([
    { institution: "", degree: "", field: "", year: "", gpa: "" },
  ]);

  // Skills
  const [skills, setSkills] = useState("");

  const saveMutation = useMutation({
    mutationFn: () => {
      const fileName = `${personal.name.replace(/\s+/g, "_")}_Resume_${selectedTemplate}.pdf`;
      const dummyFile = new File(
        [JSON.stringify({ template: selectedTemplate, personal, experiences, educations, skills })],
        fileName,
        { type: "application/pdf" }
      );
      return api.uploadResume(dummyFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["resumes-count"] });
      toast.success("Resume saved!", { description: "You can now analyze it in the Resume Analyzer." });
      router.push("/dashboard/resumes");
    },
    onError: () => toast.error("Failed to save resume."),
  });

  const nextStep = () => {
    const idx = stepOrder.indexOf(currentStep);
    if (currentStep === "template" && !selectedTemplate) {
      toast.warning("Please select a template first.");
      return;
    }
    if (idx < stepOrder.length - 1) setCurrentStep(stepOrder[idx + 1]);
  };

  const prevStep = () => {
    const idx = stepOrder.indexOf(currentStep);
    if (idx > 0) setCurrentStep(stepOrder[idx - 1]);
  };

  const currentIdx = stepOrder.indexOf(currentStep);

  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Resume Builder</h1>
        <p className="text-[var(--muted-foreground)]">Build a professional resume with guided sections and templates.</p>
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
          {/* TEMPLATE SELECTION */}
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

          {/* PERSONAL INFO */}
          {currentStep === "personal" && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <User className="size-5 text-[var(--primary)]" /> Personal Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "name", placeholder: "Full Name *", type: "text" },
                    { key: "email", placeholder: "Email Address *", type: "email" },
                    { key: "phone", placeholder: "Phone Number", type: "text" },
                    { key: "location", placeholder: "Location (City, Country)", type: "text" },
                    { key: "linkedin", placeholder: "LinkedIn URL", type: "url" },
                    { key: "portfolio", placeholder: "Portfolio / GitHub URL", type: "url" },
                  ].map(({ key, placeholder, type }) => (
                    <input
                      key={key}
                      type={type}
                      placeholder={placeholder}
                      value={personal[key as keyof typeof personal]}
                      onChange={(e) => setPersonal((p) => ({ ...p, [key]: e.target.value }))}
                      className="h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium mb-1.5 block">Professional Summary</label>
                  <textarea
                    rows={4}
                    placeholder="Write a 2-3 sentence professional summary highlighting your experience and value proposition…"
                    value={personal.summary}
                    onChange={(e) => setPersonal((p) => ({ ...p, summary: e.target.value }))}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* EXPERIENCE */}
          {currentStep === "experience" && (
            <div className="space-y-4">
              {experiences.map((exp, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        <Briefcase className="size-4 text-[var(--primary)]" /> Position {i + 1}
                      </h3>
                      {experiences.length > 1 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-[var(--muted-foreground)] hover:text-red-500"
                          onClick={() => setExperiences((prev) => prev.filter((_, j) => j !== i))}
                        >
                          <Minus className="size-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(["company", "role", "startDate", "endDate"] as const).map((key) => (
                        <input
                          key={key}
                          type="text"
                          placeholder={key === "company" ? "Company Name" : key === "role" ? "Job Title" : key === "startDate" ? "Start Date (e.g. Jan 2022)" : "End Date (or Present)"}
                          value={exp[key]}
                          onChange={(e) => setExperiences((prev) => prev.map((x, j) => j === i ? { ...x, [key]: e.target.value } : x))}
                          className="h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                        />
                      ))}
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Key achievements and responsibilities (one per line, start with action verbs like 'Led', 'Built', 'Improved')…"
                      value={exp.bullets}
                      onChange={(e) => setExperiences((prev) => prev.map((x, j) => j === i ? { ...x, bullets: e.target.value } : x))}
                      className="w-full mt-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none"
                    />
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="outline"
                className="gap-1.5 w-full"
                onClick={() => setExperiences((prev) => [...prev, { company: "", role: "", startDate: "", endDate: "", current: false, bullets: "" }])}
              >
                <Plus className="size-4" /> Add Experience
              </Button>
            </div>
          )}

          {/* EDUCATION */}
          {currentStep === "education" && (
            <div className="space-y-4">
              {educations.map((edu, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        <GraduationCap className="size-4 text-[var(--primary)]" /> Education {i + 1}
                      </h3>
                      {educations.length > 1 && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-[var(--muted-foreground)] hover:text-red-500" onClick={() => setEducations((p) => p.filter((_, j) => j !== i))}>
                          <Minus className="size-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(["institution", "degree", "field", "year", "gpa"] as const).map((key) => (
                        <input
                          key={key}
                          type="text"
                          placeholder={key === "institution" ? "University / Institution" : key === "degree" ? "Degree (e.g. Bachelor's)" : key === "field" ? "Field of Study" : key === "year" ? "Graduation Year" : "GPA (optional)"}
                          value={edu[key]}
                          onChange={(e) => setEducations((prev) => prev.map((x, j) => j === i ? { ...x, [key]: e.target.value } : x))}
                          className="h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="gap-1.5 w-full" onClick={() => setEducations((p) => [...p, { institution: "", degree: "", field: "", year: "", gpa: "" }])}>
                <Plus className="size-4" /> Add Education
              </Button>
            </div>
          )}

          {/* SKILLS */}
          {currentStep === "skills" && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Code className="size-5 text-[var(--primary)]" /> Skills
                </h2>
                <label className="text-sm font-medium mb-1.5 block">Technical & Soft Skills</label>
                <textarea
                  rows={6}
                  placeholder="List your skills, tools, and technologies. Separate by commas or line breaks.&#10;&#10;e.g., React, Node.js, Python, SQL, System Design, AWS, Team Leadership, Agile/Scrum…"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none"
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  Tip: Include both technical skills and soft skills. Match keywords from your target job descriptions.
                </p>
              </CardContent>
            </Card>
          )}

          {/* REVIEW */}
          {currentStep === "review" && (
            <Card className="border-[var(--primary)]/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle2 className="size-5 text-emerald-500" />
                  <h2 className="font-semibold text-lg">Review Your Resume</h2>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                    <div className="font-medium mb-2">Template: <Badge variant="outline" className="capitalize ml-1">{selectedTemplate}</Badge></div>
                    <div className="text-[var(--muted-foreground)]">{personal.name || "Name not set"} · {personal.email || "Email not set"} · {personal.location || "Location not set"}</div>
                  </div>
                  {personal.summary && (
                    <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                      <div className="font-medium mb-1">Summary</div>
                      <div className="text-[var(--muted-foreground)] text-xs">{personal.summary}</div>
                    </div>
                  )}
                  <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                    <div className="font-medium mb-1">Experience ({experiences.filter((e) => e.company).length} positions)</div>
                    <div className="text-[var(--muted-foreground)] text-xs">{experiences.filter((e) => e.company).map((e) => `${e.role} @ ${e.company}`).join(" · ") || "None added"}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                    <div className="font-medium mb-1">Education ({educations.filter((e) => e.institution).length} entries)</div>
                    <div className="text-[var(--muted-foreground)] text-xs">{educations.filter((e) => e.institution).map((e) => `${e.degree} in ${e.field} — ${e.institution}`).join(" · ") || "None added"}</div>
                  </div>
                  {skills && (
                    <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                      <div className="font-medium mb-1">Skills</div>
                      <div className="text-[var(--muted-foreground)] text-xs line-clamp-2">{skills}</div>
                    </div>
                  )}
                </div>

                <Button
                  variant="glow"
                  className="w-full gap-1.5 mt-6"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || !personal.name}
                >
                  {saveMutation.isPending ? (
                    <><Loader2 className="size-4 animate-spin" /> Saving Resume…</>
                  ) : (
                    <><Sparkles className="size-4" /> Save & Analyze Resume</>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="gap-1.5" onClick={prevStep} disabled={currentIdx === 0}>
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
