import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "ReviewDock — Website Review & Feedback Platform",
    template: "%s | ReviewDock",
  },
  description:
    "The fastest way for teams to review, annotate, and approve web designs. Click any element on a live website and leave pinned feedback.",
  keywords: ["website review", "feedback", "annotation", "design review", "web review"],
  authors: [{ name: "ReviewDock" }],
  openGraph: {
    type: "website",
    title: "ReviewDock — Website Review & Feedback Platform",
    description: "Click any element on a live website and leave pinned feedback.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <SessionProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
