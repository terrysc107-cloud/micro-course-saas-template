"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Zap, CheckCircle2, BookOpen, DollarSign, Code2, Users,
  ChevronRight, Star, Lock, Clock, Trophy
} from "lucide-react";

const MODULES = [
  { num: "01", title: "Getting Started", desc: "Install Claude Code, set up your API keys, and run your first AI-assisted command.", lessons: 4 },
  { num: "02", title: "Core Concepts", desc: "Understand context, write effective prompts, and master the edit-review-accept loop.", lessons: 4 },
  { num: "03", title: "Working with Files", desc: "Open real projects, create new files, refactor messy code, and explain anything.", lessons: 4 },
  { num: "04", title: "Real Dev Workflows", desc: "Build features, debug bugs, write tests, and manage Git — all with Claude Code.", lessons: 4 },
  { num: "05", title: "Advanced Prompting", desc: "CLAUDE.md setup, prompt chaining, code review mode, and staying in scope.", lessons: 4 },
  { num: "06", title: "Specific Stacks", desc: "Next.js, Python, SQL databases, REST APIs, and CLI tools — stack-specific tactics.", lessons: 5 },
  { num: "07", title: "Productivity & Best Practices", desc: "Daily workflow habits, cost management, security mindset, and team usage.", lessons: 5 },
  { num: "08", title: "Making Money with Claude Code", desc: "Freelance faster, build a micro-SaaS, automate client work, and productize your skills.", lessons: 5, highlight: true },
];

const TESTIMONIALS = [
  { name: "Marcus T.", role: "Freelance Developer", text: "I doubled my hourly output within a week. Claude Code handles the boilerplate so I can focus on architecture. Paid for itself on the first client project." },
  { name: "Priya S.", role: "Career Changer", text: "I had zero professional dev experience. After finishing this course I landed my first freelance gig. The Module 8 content on making money is pure gold." },
  { name: "Derek L.", role: "Full-Stack Engineer", text: "The testing and git workflow lessons changed how I work. My PRs are smaller and cleaner. My team lead literally asked what I'd been doing differently." },
];

function UpgradeScroller() {
  const searchParams = useSearchParams();
  const upgrade = searchParams.get("upgrade");
  useEffect(() => {
    if (upgrade === "true") {
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [upgrade]);
  return null;
}

export default function LandingPage() {
  async function handleBuyNow() {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    if (res.status === 401) {
      window.location.href = "/sign-up";
      return;
    }
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Suspense fallback={null}><UpgradeScroller /></Suspense>
      {/* Nav */}
      <nav className="border-b border-slate-800/50 sticky top-0 z-10 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Zap className="w-5 h-5 text-brand-400" />
            Claude Code Class
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-slate-400 hover:text-white text-sm transition-colors">
              Sign in
            </Link>
            <button
              onClick={handleBuyNow}
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Get Access — $97
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-900/40 text-brand-300 text-sm px-4 py-1.5 rounded-full border border-brand-800/50 mb-6">
          <Star className="w-3.5 h-3.5" />
          The only Claude Code course built around real dev workflows
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
          Build 10× faster with{" "}
          <span className="text-brand-400">Claude Code</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Go from zero to shipping AI-assisted code in hours, not weeks. 8 modules, 35+ lessons,
          and a full module on turning Claude Code into real income.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleBuyNow}
            className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-colors"
          >
            Start Learning — $97 <ChevronRight className="w-5 h-5" />
          </button>
          <Link
            href="#curriculum"
            className="inline-flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
          >
            See the Curriculum
          </Link>
        </div>
        <p className="text-slate-600 text-sm mt-4">One-time payment · Lifetime access · No subscription</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto mt-14">
          {[
            { icon: BookOpen, val: "35+", label: "Lessons" },
            { icon: Clock, val: "6 hrs", label: "Content" },
            { icon: Trophy, val: "8", label: "Modules" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <Icon className="w-5 h-5 text-brand-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{val}</p>
              <p className="text-slate-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you'll learn */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-3">What you&apos;ll be able to do</h2>
        <p className="text-slate-400 text-center mb-10">Real skills you can use from day one.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            "Install and configure Claude Code in minutes",
            "Write prompts that get the code you actually want",
            "Refactor, debug, and explain any codebase",
            "Build and ship features 5–10× faster",
            "Set up CLAUDE.md for any project type",
            "Write test suites automatically",
            "Use Claude Code across Next.js, Python, SQL, and more",
            "Land freelance clients using your new AI workflow",
            "Build and launch a micro-SaaS using only Claude Code",
            "Automate client deliverables to scale your income",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-3">Full Curriculum</h2>
        <p className="text-slate-400 text-center mb-10">8 focused modules. Progress is gated by quiz — no skipping ahead.</p>
        <div className="space-y-3">
          {MODULES.map((mod) => (
            <div
              key={mod.num}
              className={`rounded-xl border p-5 flex items-center gap-5 ${
                mod.highlight
                  ? "border-brand-700/50 bg-brand-900/20"
                  : "border-slate-800 bg-slate-900"
              }`}
            >
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 text-sm font-bold shrink-0">
                {mod.num}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold">{mod.title}</h3>
                  {mod.highlight && (
                    <span className="bg-brand-600/30 text-brand-300 text-xs px-2 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm mt-0.5">{mod.desc}</p>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-sm shrink-0">
                <BookOpen className="w-4 h-4" />
                {mod.lessons} lessons
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-10">What students say</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div>
                <p className="text-white font-medium text-sm">{t.name}</p>
                <p className="text-slate-500 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Who this is for</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: Code2, title: "Developers", desc: "Any skill level. You'll ship faster, write better tests, and stop wasting hours on boilerplate." },
            { icon: DollarSign, title: "Freelancers", desc: "Take on more clients, deliver faster, and charge more. Module 8 alone will pay for the course." },
            { icon: Users, title: "Career Changers", desc: "No experience? No problem. Claude Code accelerates your learning curve dramatically." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-brand-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-brand-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-2xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-3">Simple Pricing</h2>
        <p className="text-slate-400 text-center mb-10">One payment. Lifetime access. No subscription.</p>
        <div className="bg-slate-900 border-2 border-brand-600/50 rounded-2xl p-8 text-center relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
              Best Value
            </span>
          </div>
          <div className="mb-6">
            <span className="text-6xl font-extrabold text-white">$97</span>
            <span className="text-slate-400 text-lg ml-2">one-time</span>
          </div>
          <ul className="space-y-3 mb-8 text-left max-w-xs mx-auto">
            {[
              "8 modules, 35+ lessons",
              "Quiz-gated progress tracking",
              "Module 8: Making Money with Claude Code",
              "Lifetime access + future updates",
              "Works on any device",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={handleBuyNow}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl text-lg font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Get Instant Access
          </button>
          <p className="text-slate-600 text-xs mt-4">Secure checkout powered by Stripe</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-brand-400" />
          <span className="text-white font-semibold">Claude Code Class</span>
        </div>
        <p>© {new Date().getFullYear()} Claude Code Class · All rights reserved</p>
      </footer>
    </div>
  );
}
