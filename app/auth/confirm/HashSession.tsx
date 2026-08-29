"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Last-resort handler for auth links that deliver tokens in the URL FRAGMENT.
 *
 * The fragment is never sent to the server, so a server route cannot see
 * `#access_token=...` at all. The previous callback only understood `?code=`
 * and bounced everything else to /sign-in?error=auth.
 *
 * That mattered more after checkout changed: buyers are now provisioned by
 * invite email, and an invite that lands here in fragment form would have sent
 * someone who had just paid to an error page.
 */
export default function HashSession({ next }: { next: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      setFailed(true);
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth
      .setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) {
          setFailed(true);
          return;
        }
        // Replace so the tokens do not sit in history.
        window.location.replace(next);
      })
      .catch(() => setFailed(true));
  }, [next]);

  return (
    <main className="min-h-[100dvh] bg-background flex items-center justify-center px-4">
      <div className="text-center">
        {failed ? (
          <>
            <p className="text-slate-50 font-semibold">That link could not be used.</p>
            <p className="mt-2 text-sm text-slate-400">
              It may have expired or already been used. Request a new one from the
              sign-in page.
            </p>
            <a
              href="/sign-in"
              className="mt-6 inline-block rounded-full bg-gold px-6 py-3 text-sm font-semibold text-slate-50"
            >
              Go to sign in
            </a>
          </>
        ) : (
          <p className="text-slate-400">Signing you in…</p>
        )}
      </div>
    </main>
  );
}
