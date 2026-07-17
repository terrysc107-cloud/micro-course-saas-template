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

const TITLE = `${BRAND.name} — The professional Claude Code workflow`;
const DESCRIPTION =
  "Learn the workflow professionals use with Claude Code: inspect, plan, build, review, test, ship. Written lessons, a guided capstone, and templates you can reuse. " +
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
      <body className="font-sans min-h-full bg-background text-white antialiased">
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
