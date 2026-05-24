import type { Metadata } from "next";
import { Geist, JetBrains_Mono, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { A11yProvider } from "@/components/A11ySettings";
import { SkipToContent } from "@/components/SkipToContent";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "ClosrAI — Warm AI for sales, support & care",
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
      data-text-size="default"
      data-dyslexia="false"
      data-high-contrast="false"
      data-reduce-motion="false"
      data-underline-links="false"
      className={`${geist.variable} ${jetbrainsMono.variable} ${atkinson.variable}`}
    >
      <body>
        <A11yProvider>
          <SkipToContent />
          {children}
        </A11yProvider>
      </body>
    </html>
  );
}
