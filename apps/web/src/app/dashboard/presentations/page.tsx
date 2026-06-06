"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Presentation as PresentationIcon,
  Plus,
  Sparkles,
  Trash2,
  Clock,
  LayoutList,
  AlertCircle,
  Loader2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type PresentationResponse } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

/* ── Status Badge ───────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "completed") return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-xs">Completed</Badge>;
  if (s === "generating") return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20 text-xs gap-1"><Loader2 className="size-2.5 animate-spin" />Generating</Badge>;
  if (s === "failed") return <Badge className="bg-red-500/15 text-red-600 border-red-500/20 text-xs">Failed</Badge>;
  return <Badge variant="outline" className="text-xs capitalize">{status}</Badge>;
}

/* ── Slide Viewer Modal ─────────────────────────────────── */
function SlideViewerModal({
  presentationId,
  onClose,
}: {
  presentationId: string;
  onClose: () => void;
}) {
  const [slideIndex, setSlideIndex] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["presentation", presentationId],
    queryFn: () => api.getPresentation(presentationId),
    staleTime: 60_000,
  });

  const presentation = data?.data as PresentationResponse | undefined;
  const slides = presentation?.slides ?? [];
  const currentSlide = slides[slideIndex];
  const total = slides.length;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
          <div className="min-w-0">
            <h2 className="font-semibold truncate">{presentation?.title ?? "Loading…"}</h2>
            {total > 0 && (
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Slide {slideIndex + 1} of {total}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
            aria-label="Close slide viewer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-8 text-[var(--primary)] animate-spin" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="size-10 text-red-500 mb-3 opacity-70" />
              <p className="text-sm text-[var(--muted-foreground)]">Failed to load slides.</p>
            </div>
          )}

          {!isLoading && !isError && slides.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Layers className="size-10 text-[var(--muted-foreground)] mb-3 opacity-40" />
              <p className="text-sm text-[var(--muted-foreground)]">
                No slides available. This presentation may have failed to generate.
              </p>
            </div>
          )}

          {!isLoading && currentSlide && (
            <AnimatePresence mode="wait">
              <motion.div
                key={slideIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Slide preview */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 p-6 mb-4 min-h-[200px]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold">
                      {currentSlide.order}
                    </span>
                    <h3 className="font-semibold text-base">{currentSlide.title}</h3>
                    {currentSlide.layout && (
                      <Badge variant="outline" className="text-xs capitalize ml-auto">{currentSlide.layout}</Badge>
                    )}
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed">
                    {currentSlide.content || <span className="italic opacity-60">No content for this slide.</span>}
                  </div>
                </div>

                {/* Speaker notes */}
                {currentSlide.notes && (
                  <div className="rounded-xl border border-[var(--border)] bg-amber-500/5 border-amber-500/20 p-4">
                    <p className="text-xs font-semibold text-amber-600 mb-1.5 flex items-center gap-1.5">
                      <FileText className="size-3.5" /> Speaker Notes
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{currentSlide.notes}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Navigation footer */}
        {total > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--border)] flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
              disabled={slideIndex === 0}
            >
              <ChevronLeft className="size-4" /> Prev
            </Button>

            {/* Dot indicators — show up to 12 */}
            <div className="flex items-center gap-1 overflow-hidden">
              {slides.slice(0, 12).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === slideIndex ? "bg-[var(--primary)] w-5" : "bg-[var(--muted-foreground)]/30 w-1.5 hover:bg-[var(--muted-foreground)]/60"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
              {slides.length > 12 && (
                <span className="text-xs text-[var(--muted-foreground)] ml-1">+{slides.length - 12}</span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setSlideIndex((i) => Math.min(total - 1, i + 1))}
              disabled={slideIndex >= total - 1}
            >
              Next <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ── Presentation Card ──────────────────────────────────── */
function PresentationCard({
  presentation,
  onDelete,
  onView,
  isDeleting,
}: {
  presentation: { id: string; title: string; sourceType: string; slideCount: number; status: string; createdAt: string };
  onDelete: (id: string, title: string) => void;
  onView: (id: string) => void;
  isDeleting: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(presentation.id, presentation.title);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      // Auto-cancel confirm after 4 seconds
      setTimeout(() => setConfirmDelete(false), 4000);
    }
  };

  const isCompleted = presentation.status.toLowerCase() === "completed";

  return (
    <Card className="group h-full hover:shadow-md hover:border-[var(--primary)]/20 transition-all duration-300 overflow-hidden">
      {/* Visual preview area */}
      <div className="h-36 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 relative overflow-hidden flex items-center justify-center">
        <PresentationIcon className="size-10 text-[var(--primary)]/30" />
        {/* Slide count decorative indicator */}
        <div className="absolute bottom-2 left-2 flex gap-0.5">
          {Array.from({ length: Math.min(presentation.slideCount, 8) }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-5 rounded-full bg-[var(--primary)]/20"
              style={{ opacity: 1 - i * 0.1 }}
            />
          ))}
          {presentation.slideCount > 8 && (
            <div className="h-1.5 w-3 rounded-full bg-[var(--primary)]/10" />
          )}
        </div>
        <div className="absolute top-2 right-2">
          <StatusBadge status={presentation.status} />
        </div>

        {/* Hover overlay for "View Slides" */}
        {isCompleted && (
          <div className="absolute inset-0 bg-[var(--primary)]/0 group-hover:bg-[var(--primary)]/5 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              variant="glow"
              size="sm"
              className="gap-1.5 shadow-lg"
              onClick={() => onView(presentation.id)}
            >
              <Eye className="size-3.5" /> View Slides
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2 leading-snug">{presentation.title}</h3>
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-3">
          <LayoutList className="size-3 flex-shrink-0" />
          <span>{presentation.slideCount} slides</span>
          <span>·</span>
          <Clock className="size-3 flex-shrink-0" />
          <span>{new Date(presentation.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize flex-shrink-0">
            {presentation.sourceType?.toLowerCase() ?? "prompt"}
          </Badge>
          <div className="flex-1" />

          {/* View button (always visible for completed) */}
          {isCompleted && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
              onClick={() => onView(presentation.id)}
              title="View slides"
            >
              <Eye className="size-3.5" />
            </Button>
          )}

          {/* Delete button with inline confirm */}
          <AnimatePresence mode="wait">
            {confirmDelete ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1"
              >
                <span className="text-xs text-red-500 font-medium">Sure?</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs text-red-500 hover:bg-red-500/10"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="size-3 animate-spin" /> : "Yes"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => setConfirmDelete(false)}
                >
                  No
                </Button>
              </motion.div>
            ) : (
              <motion.div key="delete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  title="Delete presentation"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Main Page ──────────────────────────────────────────── */
export default function PresentationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  /* ── Fetch presentations ───────────────────────────── */
  const { data, isLoading, isError } = useQuery({
    queryKey: ["presentations", page],
    queryFn: () => api.listPresentations(page, 12),
    staleTime: 15_000,
  });

  /* ── Delete mutation ───────────────────────────────── */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deletePresentation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presentations"] });
      queryClient.invalidateQueries({ queryKey: ["presentations-count"] });
      queryClient.invalidateQueries({ queryKey: ["recent-presentations"] });
      toast.success("Presentation deleted.");
      setDeletingId(null);
    },
    onError: (err) => {
      toast.error("Failed to delete", {
        description: err instanceof Error ? err.message : "Unknown error. Please try again.",
      });
      setDeletingId(null);
    },
  });

  const handleDelete = (id: string, title: string) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
    toast.info(`Deleting "${title}"…`);
  };

  const presentations = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const totalElements = data?.data?.totalElements ?? 0;

  return (
    <motion.div className="max-w-7xl space-y-8" initial="hidden" animate="visible">

      {/* Header */}
      <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between gap-4">
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
          <Button variant="glow" className="gap-1.5 flex-shrink-0">
            <Plus className="size-4" />
            New Presentation
          </Button>
        </Link>
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <motion.div variants={fadeUp} custom={1} className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 text-[var(--primary)] animate-spin" />
            <p className="text-sm text-[var(--muted-foreground)]">Loading presentations…</p>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {isError && (
        <motion.div variants={fadeUp} custom={1}>
          <Card className="border-red-500/20">
            <CardContent className="p-8 text-center">
              <AlertCircle className="size-10 text-red-500 mx-auto mb-3 opacity-70" />
              <p className="font-medium mb-1">Failed to load presentations</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Check your connection and refresh the page.
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
              <PresentationIcon className="size-12 text-[var(--muted-foreground)] mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">No presentations yet</h3>
              <p className="text-[var(--muted-foreground)] text-sm mb-6 max-w-md mx-auto">
                Create your first AI-powered presentation. Generate from a prompt, upload a PDF, or paste a URL.
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {presentations.map((p, i) => (
            <motion.div key={p.id} variants={fadeUp} custom={i + 2}>
              <PresentationCard
                presentation={p}
                onDelete={handleDelete}
                onView={setViewingId}
                isDeleting={deletingId === p.id && deleteMutation.isPending}
              />
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

      {/* Slide Viewer Modal */}
      <AnimatePresence>
        {viewingId && (
          <SlideViewerModal
            presentationId={viewingId}
            onClose={() => setViewingId(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
