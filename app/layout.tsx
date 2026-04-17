import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Claude Code Mastery — Learn AI-Assisted Development",
  description:
    "The complete beginner course to Claude Code. Build faster, debug smarter, and unlock new income streams with AI-assisted development.",
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
