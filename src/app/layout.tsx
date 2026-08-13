import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import BottomNav from "@/components/BottomNav";
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
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Lingo", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  // Installed-app behaviour: fill the notch area, and don't let a double-tap
  // zoom the interface the way it would on a normal web page.
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/*
          Applies the saved theme before the page paints.

          A plain <script src>, not next/script: `beforeInteractive` emits only
          a <link rel="preload"> in the App Router, so the file downloads but
          never executes and the theme never applies. A real tag is parsed and
          run inline, which is exactly the blocking behaviour this needs.
        */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme-boot.js" />
        <SiteHeader />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
