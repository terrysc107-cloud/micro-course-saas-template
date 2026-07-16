import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BRAND, DISCLAIMER } from "@/lib/course-config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-slate-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
