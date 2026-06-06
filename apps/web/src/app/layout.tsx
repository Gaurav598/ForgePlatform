import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "FORGE AI — AI Career & Content Platform",
  description:
    "The unified AI platform for presentations, resume analysis, career growth, and professional documents. Create, analyze, and optimize with AI.",
  keywords: [
    "AI presentations",
    "resume analyzer",
    "career AI",
    "AI resume builder",
    "interview preparation",
    "ATS score",
  ],
  openGraph: {
    title: "FORGE AI — AI Career & Content Platform",
    description:
      "Create presentations, analyze resumes, prepare for interviews, and accelerate your career — all powered by AI.",
    type: "website",
    siteName: "FORGE AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster
              position="bottom-right"
              richColors
              closeButton
              toastOptions={{
                className: "glass-strong",
              }}
            />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

