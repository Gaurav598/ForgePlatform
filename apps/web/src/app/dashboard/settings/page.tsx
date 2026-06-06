"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User, Shield, Bell, Palette, Loader2,
  CheckCircle2, Lock, Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth-store";
import { api } from "@/lib/api";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [email] = useState(user?.email ?? "");

  // Sync when user loads
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user?.name) setName(user.name);
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: () => api.updateProfile(name || undefined),
    onSuccess: (res) => {
      if (res.data) setUser(res.data);
      toast.success("Profile updated successfully!");
    },
    onError: (err) => toast.error("Update failed", { description: err instanceof Error ? err.message : "Unknown error" }),
  });

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <motion.div className="max-w-3xl space-y-8" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-[var(--muted-foreground)]">Manage your account, preferences, and notifications.</p>
      </motion.div>

      {/* Profile */}
      <motion.div variants={fadeUp} custom={1}>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <User className="size-5 text-[var(--primary)]" /> Profile
            </h2>
            <div className="flex items-center gap-5 mb-6">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/60 flex items-center justify-center text-2xl font-bold text-[var(--primary-foreground)] select-none">
                {initials}
              </div>
              <div>
                <p className="font-semibold">{user?.name ?? "—"}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{user?.email ?? "—"}</p>
                <Badge className="mt-1 capitalize text-xs">{user?.plan?.toLowerCase() ?? "free"} Plan</Badge>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 px-3 text-sm text-[var(--muted-foreground)] cursor-not-allowed"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[var(--muted-foreground)]" />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">Email cannot be changed directly. Contact support.</p>
              </div>
              <Button
                variant="glow"
                className="gap-1.5"
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending || name === user?.name}
              >
                {updateMutation.isPending ? (
                  <><Loader2 className="size-4 animate-spin" /> Saving…</>
                ) : (
                  <><CheckCircle2 className="size-4" /> Save Changes</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div variants={fadeUp} custom={2}>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <Shield className="size-5 text-[var(--primary)]" /> Security
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                <div>
                  <div className="font-medium text-sm">Password</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Last changed: Never</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.info("Password change coming soon")}>
                  Change Password
                </Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                <div>
                  <div className="font-medium text-sm">Two-Factor Authentication</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Add an extra layer of security</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.info("2FA setup coming soon")}>
                  Enable 2FA
                </Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-sm">Active Sessions</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Revoke all sessions except the current one</div>
                </div>
                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:border-red-500/30" onClick={() => toast.info("Session management coming soon")}>
                  Revoke All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={fadeUp} custom={3}>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <Bell className="size-5 text-[var(--primary)]" /> Notifications
            </h2>
            <div className="space-y-4">
              {[
                { label: "Email notifications", desc: "Receive updates about your documents and analyses" },
                { label: "Weekly digest", desc: "Summary of your activity and tips" },
                { label: "Product updates", desc: "New features and improvements" },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-[var(--muted)] rounded-full peer peer-checked:bg-[var(--primary)] transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={fadeUp} custom={4}>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <Palette className="size-5 text-[var(--primary)]" /> Appearance
            </h2>
            <div>
              <label className="text-sm font-medium mb-3 block">Theme</label>
              <div className="flex gap-3">
                {[
                  { id: "system", label: "System" },
                  { id: "light", label: "Light" },
                  { id: "dark", label: "Dark" },
                ].map((t) => (
                  <button key={t.id} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm hover:border-[var(--primary)]/40 transition-colors capitalize">
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={fadeUp} custom={5}>
        <Card className="border-red-500/20">
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4 text-red-500 flex items-center gap-2">
              <Trash2 className="size-5" /> Danger Zone
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Delete Account</div>
                <div className="text-xs text-[var(--muted-foreground)]">Permanently delete your account and all data. This cannot be undone.</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                onClick={() => toast.error("Account deletion requires email verification. Feature coming soon.")}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
