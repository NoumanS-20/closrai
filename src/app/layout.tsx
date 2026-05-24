import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { A11yProvider } from "@/components/A11ySettings";
import { SkipToContent } from "@/components/SkipToContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClosrAI Platform — Sales, Support, Care bots that argue with themselves",
  description:
    "ClosrAI is a multi-track AI bot platform — Sales SDR, Support Agent, and Customer Care, all sharing one agent runtime with a Skeptic-vs-Closer multi-agent debate, live IQ scoring, voice mode, and a one-line script embed. Built for the FlowZint AI Hackathon 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-zinc-950 text-zinc-100">
        <A11yProvider>
          <SkipToContent />
          {children}
        </A11yProvider>
      </body>
    </html>
  );
}
