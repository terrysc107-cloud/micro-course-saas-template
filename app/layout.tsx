import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { BRAND, DISCLAIMER } from "@/lib/course-config";
import "./globals.css";

/**
 * Geist Sans is the AI by Design typeface (BRAND-KIT.md §3).
 *
 * `variable` — not `className` — because globals.css resolves --font-sans
 * through it, and the variable name matches by-design-ai's so the two sites
 * render identically. next/font self-hosts, so there is no request to Google.
 */
const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

const TITLE = `${BRAND.name}: build an AI board for your business`;
const DESCRIPTION =
  "Build a few narrow AI assistants that read your real numbers on a schedule and hand you a meeting you can act on. Written for people who have never coded. " +
  DISCLAIMER;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(BRAND.siteUrl),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: BRAND.siteUrl,
    siteName: BRAND.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${geist.variable}`}>
      <body className="font-sans min-h-full bg-background text-slate-50 antialiased">
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
