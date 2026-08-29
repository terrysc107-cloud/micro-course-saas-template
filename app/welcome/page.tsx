import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck, ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/course-config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: `You're in — ${BRAND.name}`,
  robots: { index: false },
};

/**
 * Post-purchase landing.
 *
 * Reachable signed OUT, which is the whole point: buyers no longer need an
 * account before paying, so most people arriving here have no session. The
 * previous success_url was /dashboard, which would have bounced them straight
 * to sign-in seconds after taking their money.
 *
 * Two audiences, one page. Someone who bought while signed in can go straight
 * in. Someone who bought anonymously has an account waiting on a set-password
 * email, and needs to be told that clearly enough that they go and look.
 */
export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-[100dvh] bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <div className="rounded-2xl border border-gold-border bg-slate-900 p-7 sm:p-10">
          <MailCheck className="h-9 w-9 text-gold-ink" aria-hidden />

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-50">
            Payment received. You&apos;re in.
          </h1>

          {user ? (
            <>
              <p className="mt-4 leading-relaxed text-slate-400">
                Your account already has access. Start whenever you like, and the
                first module takes about twenty minutes.
              </p>
              <Link
                href="/dashboard"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-slate-50 transition-transform hover:brightness-95 active:scale-[0.98]"
              >
                Go to the course
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </>
          ) : (
            <>
              <p className="mt-4 leading-relaxed text-slate-400">
                We&apos;ve created your account and emailed you a link to set a
                password. Click it and you&apos;re straight into the course.
              </p>

              <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950/40 p-5">
                <p className="text-sm leading-relaxed text-slate-300">
                  <span className="font-semibold text-slate-50">
                    Check your inbox now
                  </span>{" "}
                  for the email titled &ldquo;You have been invited&rdquo;. If it
                  is not there in a few minutes, look in spam. The link is what
                  gives you access, so it is worth finding before you close this
                  tab.
                </p>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-slate-500">
                Already had an account with that email? Nothing new was created.
                Just{" "}
                <Link
                  href="/sign-in"
                  className="text-gold-ink underline underline-offset-4"
                >
                  sign in
                </Link>{" "}
                and the course will be unlocked.
              </p>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Something wrong? Reply to your receipt and it gets fixed by a person.
        </p>
      </div>
    </main>
  );
}
