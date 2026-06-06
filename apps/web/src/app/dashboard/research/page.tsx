"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search, Sparkles, BookOpen, BarChart3, Globe, Loader2,
  Copy, Check, RefreshCw, Tag,
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

const researchTypes = [
  { id: "overview", label: "Overview", desc: "Executive summary of the topic" },
  { id: "trends", label: "Industry Trends", desc: "Latest trends and market dynamics" },
  { id: "skills", label: "Skills Required", desc: "Key skills and competencies" },
  { id: "companies", label: "Top Companies", desc: "Leading companies and their profiles" },
];

const popularTopics = [
  "AI in Healthcare", "Remote Work Trends", "Web3 & Blockchain",
  "Sustainable Tech", "Product Management", "Data Science Career",
];

const RESEARCH_SYSTEM = "You are an expert research analyst. Provide accurate, well-structured, and insightful research summaries. Use clear headings, bullet points, and specific data where relevant. Keep responses comprehensive but scannable.";

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [researchType, setResearchType] = useState("overview");
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const searchMutation = useMutation({
    mutationFn: () => {
      const typeLabels: Record<string, string> = {
        overview: "a comprehensive overview including definition, key concepts, current state, importance, and future outlook",
        trends: "the latest trends, market dynamics, growth statistics, disruptions, and future predictions",
        skills: "the essential skills, certifications, tools, frameworks, and learning resources required",
        companies: "the top companies, their market position, culture, notable products, and career opportunities",
      };

      return api.generateAI(
        `Research topic: "${query}"\n\nProvide ${typeLabels[researchType]} for this topic.\n\nFormat with clear sections, use bullet points, and include specific examples and data points where possible.`,
        RESEARCH_SYSTEM,
        0.5,
        2000
      );
    },
    onSuccess: (res) => {
      if (res.data?.content) {
        setResult(res.data.content);
        toast.success("Research complete!");
      }
    },
    onError: () => toast.error("Research failed. Please try again."),
  });

  const handleSearch = () => {
    if (!query.trim()) { toast.warning("Please enter a research topic."); return; }
    setResult("");
    searchMutation.mutate();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Research Assistant</h1>
        <p className="text-[var(--muted-foreground)]">AI-powered research on any topic, industry, or technology.</p>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} custom={1}>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Research any topic — technology, industry, company, concept…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full h-12 rounded-2xl border border-[var(--border)] bg-[var(--background)] pl-12 pr-4 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
              />
            </div>

            {/* Research Type */}
            <div className="flex flex-wrap gap-2">
              {researchTypes.map((rt) => (
                <button
                  key={rt.id}
                  onClick={() => setResearchType(rt.id)}
                  title={rt.desc}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    researchType === rt.id
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>

            {/* Popular topics */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-[var(--muted-foreground)]">Popular:</span>
              {popularTopics.map((t) => (
                <button
                  key={t}
                  onClick={() => { setQuery(t); setResult(""); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-[var(--muted)]/50 hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  <Tag className="size-2.5" />
                  {t}
                </button>
              ))}
            </div>

            <Button
              variant="glow"
              className="w-full gap-1.5"
              onClick={handleSearch}
              disabled={searchMutation.isPending}
            >
              {searchMutation.isPending ? (
                <><Loader2 className="size-4 animate-spin" /> Researching…</>
              ) : (
                <><Sparkles className="size-4" /> Research</>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <Card className="border-[var(--primary)]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-5 text-[var(--primary)]" />
                    <h3 className="font-semibold">Research: <span className="text-gradient">{query}</span></h3>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={handleCopy}>
                      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setResult(""); searchMutation.reset(); }}>
                      <RefreshCw className="size-3.5" />
                      New
                    </Button>
                  </div>
                </div>
                <div className="text-sm leading-relaxed space-y-1">
                  {result.split("\n").map((line, i) => {
                    if (!line.trim()) return <br key={i} />;
                    if (line.startsWith("## ") || line.startsWith("# "))
                      return <h3 key={i} className="font-bold text-base mt-4 mb-1">{line.replace(/^#+ /, "")}</h3>;
                    if (line.startsWith("### "))
                      return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.replace(/^#+ /, "")}</h4>;
                    if (line.startsWith("- ") || line.startsWith("• "))
                      return (
                        <p key={i} className="flex gap-2 text-[var(--muted-foreground)]">
                          <span className="text-[var(--primary)] flex-shrink-0">•</span>
                          {line.replace(/^[-•] /, "").replace(/\*\*/g, "")}
                        </p>
                      );
                    if (/^\d+\./.test(line))
                      return <p key={i} className="text-[var(--muted-foreground)] pl-2">{line}</p>;
                    return <p key={i} className="text-[var(--muted-foreground)]">{line.replace(/\*\*/g, "")}</p>;
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature highlights (idle state) */}
      {!result && !searchMutation.isPending && (
        <motion.div variants={fadeUp} custom={2} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Globe, label: "Industry Research", desc: "Market analysis, trends, and competitive landscape" },
            { icon: BarChart3, label: "Data Insights", desc: "Key metrics and statistics with context" },
            { icon: BookOpen, label: "Learning Resources", desc: "Books, courses, and communities to explore" },
          ].map((f) => (
            <Card key={f.label}>
              <CardContent className="p-5 text-center">
                <f.icon className="size-6 text-[var(--primary)] mx-auto mb-2" />
                <div className="font-semibold text-sm mb-1">{f.label}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{f.desc}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
