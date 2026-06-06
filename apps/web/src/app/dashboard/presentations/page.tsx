"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Presentation,
  Plus,
  Sparkles,
  Trash2,
  Clock,
  LayoutList,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "completed") return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-xs">Completed</Badge>;
  if (s === "generating") return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20 text-xs">Generating</Badge>;
  if (s === "failed") return <Badge className="bg-red-500/15 text-red-600 border-red-500/20 text-xs">Failed</Badge>;
  return <Badge variant="outline" className="text-xs capitalize">{status}</Badge>;
}

export default function PresentationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["presentations", page],
    queryFn: () => api.listPresentations(page, 10),
    staleTime: 15_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deletePresentation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presentations"] });
      queryClient.invalidateQueries({ queryKey: ["presentations-count"] });
      queryClient.invalidateQueries({ queryKey: ["recent-presentations"] });
      toast.success("Presentation deleted");
      setDeletingId(null);
    },
    onError: (err) => {
      toast.error("Failed to delete", { description: err instanceof Error ? err.message : "Unknown error" });
      setDeletingId(null);
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const presentations = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const totalElements = data?.data?.totalElements ?? 0;

  return (
    <motion.div className="max-w-7xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Presentations</h1>
          <p className="text-[var(--muted-foreground)]">
            AI-generated slide decks from any source.
            {totalElements > 0 && (
              <span className="ml-2 text-[var(--primary)] font-medium">{totalElements} total</span>
            )}
          </p>
        </div>
        <Link href="/dashboard/presentations/new">
          <Button variant="glow" className="gap-1.5">
            <Plus className="size-4" />
            New Presentation
          </Button>
        </Link>
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <motion.div variants={fadeUp} custom={1} className="flex items-center justify-center py-20">
          <Loader2 className="size-8 text-[var(--primary)] animate-spin" />
        </motion.div>
      )}

      {/* Error */}
      {isError && (
        <motion.div variants={fadeUp} custom={1}>
          <Card className="border-red-500/20">
            <CardContent className="p-8 text-center">
              <AlertCircle className="size-10 text-red-500 mx-auto mb-3 opacity-70" />
              <p className="text-sm text-[var(--muted-foreground)]">
                Failed to load presentations. Please refresh.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && presentations.length === 0 && (
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
      )}

      {/* Presentations Grid */}
      {!isLoading && presentations.length > 0 && (
        <motion.div
          variants={fadeUp}
          custom={1}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {presentations.map((p, i) => (
            <motion.div key={p.id} variants={fadeUp} custom={i + 2}>
              <Card className="group h-full hover:shadow-md hover:border-[var(--primary)]/20 transition-all duration-300 overflow-hidden">
                {/* Preview area */}
                <div className="h-36 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 relative overflow-hidden flex items-center justify-center">
                  <Presentation className="size-10 text-[var(--primary)]/40" />
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={p.status} />
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2 leading-snug">{p.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-3">
                    <LayoutList className="size-3" />
                    <span>{p.slideCount} slides</span>
                    <span>•</span>
                    <Clock className="size-3" />
                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {p.sourceType?.toLowerCase() ?? "prompt"}
                    </Badge>
                    <div className="flex-1" />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      onClick={() => handleDelete(p.id, p.title)}
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={fadeUp} custom={20} className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-[var(--muted-foreground)]">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
