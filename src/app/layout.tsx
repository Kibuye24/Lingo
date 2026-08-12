import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const sans = Bricolage_Grotesque({
  variable: "--font-sans-var",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-var",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lingo — languages, out loud",
  description:
    "Learn a language in phrases, out loud. Lessons, pronunciation drills and conversation practice.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8">{children}</main>
        <footer className="border-t border-line px-5 py-6 text-center text-xs text-muted">
          Speech runs in your browser — no API keys, no quotas. Chrome or Edge works best.
        </footer>
      </body>
    </html>
  );
}
