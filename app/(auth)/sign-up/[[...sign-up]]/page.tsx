"use client";

import { BRAND } from "@/lib/course-config";
import { useState, Suspense } from "react";
import { safeRedirect } from "@/lib/labs/intake";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Zap } from "lucide-react";

function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = safeRedirect(params.get("redirect") || params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (data.session) {
        router.push(redirect);
        router.refresh();
      } else setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✉️</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-50 mb-3">
            Check your email
          </h1>
          <p className="text-slate-400 text-sm">
            We sent a confirmation link to{" "}
            <span className="text-slate-50 font-medium">{email}</span>. Click it
            to activate your account.
          </p>
          <p className="text-slate-500 text-xs mt-4">
            Already confirmed?{" "}
            <button
              onClick={() =>
                router.push(`/sign-in?redirect=${encodeURIComponent(redirect)}`)
              }
              className="text-brand-400 hover:text-brand-300"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-50 font-bold text-lg mb-6"
          >
            <Zap className="w-5 h-5 text-brand-400" />
            {BRAND.name}
          </Link>
          <h1 className="text-2xl font-bold text-slate-50">
            Create your account
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Create an account for your course and Build Lab workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-50 text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-50 text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="Min. 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:brightness-95 text-slate-50 font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{" "}
          <Link
            href={`/sign-in?redirect=${encodeURIComponent(redirect)}`}
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<p>Loading signup…</p>}>
      <SignUpForm />
    </Suspense>
  );
}
