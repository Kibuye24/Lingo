import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import AuthGate from "@/components/AuthGate";
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
      className={`${sans.variable} ${mono.variable} antialiased`}
    >
      <head>
        <Script
          id="theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("lingo.theme.v1");var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme:dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"#0f1115":"#ffffff")}catch(e){document.documentElement.setAttribute("data-theme","light")}})();`,
          }}
        />
      </head>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5 md:max-w-2xl lg:max-w-4xl">
          <AuthGate>{children}</AuthGate>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
