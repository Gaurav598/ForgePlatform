"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, User, Bell, Shield, Palette, Globe } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

const settingsSections = [
  {
    icon: User,
    title: "Profile",
    desc: "Manage your name, email, and avatar",
    fields: [
      { label: "Full Name", value: "Gaurav", type: "text" },
      { label: "Email", value: "gaurav@example.com", type: "email" },
    ],
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "Control email and push notification preferences",
    toggles: [
      { label: "Email notifications", enabled: true },
      { label: "Marketing emails", enabled: false },
      { label: "Weekly summary", enabled: true },
    ],
  },
  {
    icon: Shield,
    title: "Security",
    desc: "Password, MFA, and session management",
    actions: ["Change Password", "Enable MFA", "Manage Sessions"],
  },
  {
    icon: Palette,
    title: "Appearance",
    desc: "Theme, language, and display preferences",
    options: ["Dark mode", "Light mode", "System"],
  },
];

export default function SettingsPage() {
  return (
    <motion.div className="max-w-3xl space-y-6" initial="hidden" animate="visible">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-[var(--muted-foreground)]">Manage your account and preferences.</p>
      </motion.div>

      {settingsSections.map((section, i) => (
        <motion.div key={section.title} variants={fadeUp} custom={i + 1}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 flex-shrink-0">
                  <section.icon className="size-5 text-[var(--primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold">{section.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{section.desc}</p>
                </div>
              </div>

              {section.fields && (
                <div className="space-y-4 ml-14">
                  {section.fields.map((field) => (
                    <div key={field.label}>
                      <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
                      <input
                        type={field.type}
                        defaultValue={field.value}
                        className="flex h-10 w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                      />
                    </div>
                  ))}
                  <Button size="sm">Save Changes</Button>
                </div>
              )}

              {section.toggles && (
                <div className="space-y-3 ml-14">
                  {section.toggles.map((toggle) => (
                    <div key={toggle.label} className="flex items-center justify-between max-w-sm">
                      <span className="text-sm">{toggle.label}</span>
                      <button
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          toggle.enabled ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            toggle.enabled ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {section.actions && (
                <div className="flex flex-wrap gap-2 ml-14">
                  {section.actions.map((action) => (
                    <Button key={action} variant="outline" size="sm">{action}</Button>
                  ))}
                </div>
              )}

              {section.options && (
                <div className="flex gap-2 ml-14">
                  {section.options.map((opt) => (
                    <Button key={opt} variant="outline" size="sm" className="capitalize">{opt}</Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
