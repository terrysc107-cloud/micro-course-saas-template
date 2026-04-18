"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import SignOutButton from "@/components/ui/SignOutButton";

interface LessonLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export default function LessonLayout({ sidebar, children }: LessonLayoutProps) {
  // Desktop: sidebar open by default; mobile: closed by default
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change (resize)
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      {/* Desktop: inline, collapsible */}
      <div
        className={`hidden md:flex flex-col transition-all duration-200 ease-in-out overflow-hidden shrink-0 ${
          desktopOpen ? "w-72" : "w-0"
        }`}
      >
        {desktopOpen && sidebar}
      </div>

      {/* Mobile: slide-in drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col transition-transform duration-200 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Course Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{sidebar}</div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50 shrink-0 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-slate-400 hover:text-white transition-colors shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setDesktopOpen((v) => !v)}
              className="hidden md:flex text-slate-400 hover:text-white transition-colors shrink-0"
              aria-label={desktopOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {desktopOpen
                ? <PanelLeftClose className="w-5 h-5" />
                : <PanelLeftOpen className="w-5 h-5" />
              }
            </button>
            <Link href="/dashboard" className="flex items-center gap-2 text-white font-semibold text-sm truncate">
              <Zap className="w-4 h-4 text-brand-400 shrink-0" />
              <span className="hidden sm:inline">Claude Code Class</span>
            </Link>
          </div>
          <SignOutButton />
        </header>

        {/* Scrollable lesson body */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
