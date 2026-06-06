"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic, Brain, Video, MessageSquare, Code, Users, Briefcase,
  ArrowRight, Loader2, Send, RefreshCw, CheckCircle2,
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

const interviewTypes = [
  { id: "technical", icon: Code, label: "Technical", desc: "DSA, system design, and coding challenges", color: "oklch(0.7 0.2 270)" },
  { id: "behavioral", icon: Users, label: "Behavioral", desc: "STAR method, leadership, and teamwork scenarios", color: "oklch(0.65 0.2 190)" },
  { id: "hr", icon: Briefcase, label: "HR Round", desc: "Salary negotiation, culture fit, and expectations", color: "oklch(0.75 0.16 80)" },
  { id: "case", icon: Brain, label: "Case Study", desc: "Problem-solving, analytics, and strategy", color: "oklch(0.65 0.22 30)" },
];

interface Message {
  role: "ai" | "user";
  content: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  technical: "You are a senior technical interviewer at a top tech company. Ask one coding/system design question at a time. After the candidate answers, give brief feedback (2-3 sentences) and then ask the next question. Keep responses concise and professional.",
  behavioral: "You are an experienced HR interviewer. Ask one behavioral question at a time using STAR method scenarios. After the candidate answers, give brief feedback and ask the next question. Keep responses concise.",
  hr: "You are an HR professional conducting a final-round interview. Ask one question at a time about culture fit, salary expectations, and career goals. After each answer, provide brief feedback and continue.",
  case: "You are a management consultant interviewer. Present one case study problem at a time. After the candidate answers, provide feedback on their framework and ask follow-up questions. Keep responses focused.",
};

export default function InterviewsPage() {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [questionCount, setQuestionCount] = useState(0);

  const startMutation = useMutation({
    mutationFn: (type: string) =>
      api.generateAI(
        "Start the interview. Introduce yourself briefly (1 sentence) and ask your first question.",
        SYSTEM_PROMPTS[type],
        0.8,
        512
      ),
    onSuccess: (res) => {
      if (res.data?.content) {
        setMessages([{ role: "ai", content: res.data.content }]);
        setQuestionCount(1);
      }
    },
    onError: () => toast.error("Failed to start interview session"),
  });

  const answerMutation = useMutation({
    mutationFn: (answer: string) => {
      const history = messages.map((m) => `${m.role === "ai" ? "Interviewer" : "Candidate"}: ${m.content}`).join("\n\n");
      const prompt = `${history}\n\nCandidate: ${answer}\n\nContinue the interview: give brief feedback on that answer, then ask the next question (question ${questionCount + 1} of 5). After question 5, wrap up with an overall assessment.`;
      return api.generateAI(prompt, SYSTEM_PROMPTS[activeType!], 0.8, 600);
    },
    onSuccess: (res) => {
      if (res.data?.content) {
        setMessages((prev) => [
          ...prev,
          { role: "user", content: userAnswer },
          { role: "ai", content: res.data!.content },
        ]);
        setUserAnswer("");
        setQuestionCount((n) => n + 1);
      }
    },
    onError: () => toast.error("Failed to get AI response"),
  });

  const handleStart = (type: string) => {
    setActiveType(type);
    setMessages([]);
    setUserAnswer("");
    setQuestionCount(0);
    startMutation.mutate(type);
  };

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return;
    answerMutation.mutate(userAnswer.trim());
  };

  const handleReset = () => {
    setActiveType(null);
    setMessages([]);
    setUserAnswer("");
    setQuestionCount(0);
  };

  const isLoading = startMutation.isPending || answerMutation.isPending;

  return (
    <motion.div className="max-w-5xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Interview Prep</h1>
          <p className="text-[var(--muted-foreground)]">Practice mock interviews with AI and get real-time feedback.</p>
        </div>
        {activeType && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleReset}>
            <RefreshCw className="size-3.5" />
            New Session
          </Button>
        )}
      </motion.div>

      {/* Interview Type Selection */}
      {!activeType && (
        <motion.div variants={fadeUp} custom={1}>
          <h2 className="text-lg font-semibold mb-4">Choose Interview Type</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {interviewTypes.map((type, i) => (
              <motion.div key={type.id} variants={fadeUp} custom={i + 2}>
                <Card className="group cursor-pointer hover:shadow-md hover:border-[var(--primary)]/30 transition-all duration-300">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${type.color}15` }}
                    >
                      <type.icon className="size-6" style={{ color: type.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{type.label}</div>
                      <div className="text-sm text-[var(--muted-foreground)] mb-3">{type.desc}</div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => handleStart(type.id)}
                        disabled={startMutation.isPending}
                      >
                        {startMutation.isPending && startMutation.variables === type.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <><ArrowRight className="size-3.5" /> Start Practice</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Active Interview Session */}
      {activeType && (
        <motion.div variants={fadeUp} custom={1} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="capitalize">{activeType} Interview</Badge>
            <span className="text-sm text-[var(--muted-foreground)]">Question {Math.min(questionCount, 5)} of 5</span>
          </div>

          {/* Chat messages */}
          <Card>
            <CardContent className="p-4 space-y-4 min-h-[300px] max-h-[450px] overflow-y-auto">
              {isLoading && messages.length === 0 && (
                <div className="flex items-center gap-3 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10 flex-shrink-0">
                    <Mic className="size-4 text-[var(--primary)]" />
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <span className="h-2 w-2 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-[var(--primary)] animate-bounce" />
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <AnimatePresence key={i}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 text-xs font-bold ${
                        msg.role === "ai"
                          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      {msg.role === "ai" ? <Mic className="size-4" /> : "You"}
                    </div>
                    <div
                      className={`flex-1 rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "ai"
                          ? "bg-[var(--muted)]/50"
                          : "bg-[var(--primary)]/10 text-[var(--foreground)]"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                </AnimatePresence>
              ))}
              {answerMutation.isPending && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10 flex-shrink-0">
                    <Mic className="size-4 text-[var(--primary)]" />
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <span className="h-2 w-2 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-[var(--primary)] animate-bounce" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Answer Input */}
          {questionCount <= 5 && messages.length > 0 && (
            <div className="flex gap-3">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer…"
                rows={3}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmitAnswer();
                }}
                className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none disabled:opacity-50"
              />
              <Button
                variant="glow"
                size="icon"
                className="h-auto aspect-square rounded-2xl"
                onClick={handleSubmitAnswer}
                disabled={isLoading || !userAnswer.trim()}
              >
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
              </Button>
            </div>
          )}
          <p className="text-xs text-[var(--muted-foreground)]">Press ⌘+Enter to submit</p>
        </motion.div>
      )}

      {/* Features */}
      {!activeType && (
        <motion.div variants={fadeUp} custom={6} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Video, label: "Video Mode", desc: "Practice with webcam for body language analysis" },
            { icon: MessageSquare, label: "Real-time Feedback", desc: "Get instant scoring on each answer" },
            { icon: Brain, label: "AI Confidence Score", desc: "Track your improvement over time" },
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
