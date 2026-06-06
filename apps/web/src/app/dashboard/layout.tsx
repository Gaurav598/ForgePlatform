"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  LayoutDashboard,
  Presentation,
  FileText,
  Mic,
  Brain,
  BookOpen,
  BarChart3,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Target,
  PenTool,
  Bell,
  Search,
  Menu,
} from "lucide-react";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Presentation, label: "Presentations", href: "/dashboard/presentations" },
  { icon: FileText, label: "Resume Analyzer", href: "/dashboard/resumes" },
  { icon: PenTool, label: "Resume Builder", href: "/dashboard/resume-builder" },
  { icon: Target, label: "Job Matching", href: "/dashboard/jobs" },
  { icon: Mic, label: "Interview Prep", href: "/dashboard/interviews" },
  { icon: Brain, label: "Career Copilot", href: "/dashboard/career" },
  { icon: BookOpen, label: "Documents", href: "/dashboard/documents" },
  { icon: BarChart3, label: "Research", href: "/dashboard/research" },
];

const bottomLinks = [
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-dvh">
      {/* ── Sidebar ──────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] transition-all duration-300",
          collapsed ? "w-[68px]" : "w-64",
          "max-lg:hidden"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 h-16 px-4 border-b border-[var(--sidebar-border)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] shadow-sm flex-shrink-0">
            <Sparkles className="size-4 text-[var(--primary-foreground)]" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight whitespace-nowrap">
              FORGE<span className="text-gradient"> AI</span>
            </span>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
                    : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? link.label : undefined}
              >
                <link.icon className="size-[18px] flex-shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[var(--sidebar-border)] py-3 px-2.5 space-y-0.5">
          {bottomLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]"
                    : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? link.label : undefined}
              >
                <link.icon className="size-[18px] flex-shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] w-full transition-all duration-200"
          >
            {collapsed ? (
              <ChevronRight className="size-[18px] flex-shrink-0 mx-auto" />
            ) : (
              <>
                <ChevronLeft className="size-[18px] flex-shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Mobile Sidebar Overlay ───────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 flex flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] animate-fade-in-up">
            <div className="flex items-center gap-2.5 h-16 px-4 border-b border-[var(--sidebar-border)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]">
                <Sparkles className="size-4 text-[var(--primary-foreground)]" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                FORGE<span className="text-gradient"> AI</span>
              </span>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]"
                        : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
                    )}
                  >
                    <link.icon className="size-[18px]" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────── */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          collapsed ? "lg:ml-[68px]" : "lg:ml-64"
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </Button>

            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 h-9 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 text-sm text-[var(--muted-foreground)] min-w-[240px]">
              <Search className="size-4" />
              <span>Search...</span>
              <kbd className="ml-auto text-xs border border-[var(--border)] rounded px-1.5 py-0.5 bg-[var(--background)]">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="size-[18px]" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--primary)]" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/60 flex items-center justify-center text-xs font-bold text-[var(--primary-foreground)] cursor-pointer">
              G
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
