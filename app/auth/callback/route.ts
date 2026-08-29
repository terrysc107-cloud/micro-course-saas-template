import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Auth callback. A ROUTE HANDLER, deliberately.
 *
 * Establishing a session means writing cookies, and Next only permits that in a
 * Route Handler or Server Action. An earlier attempt at this as a page failed
 * with exactly that error, which is worth recording so nobody tries it again.
 *
 * Handles every shape Supabase sends:
 *   ?code=...                  PKCE. The only one the original version handled.
 *   ?token_hash=...&type=...   Email links: invite, magiclink, recovery.
 *   #access_token=...          Implicit. A fragment, so the server cannot see
 *                              it; handed to /auth/confirm, which can.
 *
 * Everything unrecognised used to land on /sign-in?error=auth. That became a
 * paid-path failure when checkout started provisioning buyers by invite email:
 * pay, get invited, click the link, hit an error.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Only ever redirect to a path on this site.
  const nextRaw = searchParams.get("next") ?? "/dashboard";
  const next = nextRaw.startsWith("/") ? nextRaw : "/dashboard";

  if (code || (tokenHash && type)) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(toSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            );
          },
        },
      }
    );

    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type! });

    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("[auth/callback] exchange failed:", error.message);
    return NextResponse.redirect(`${origin}/sign-in?error=auth`);
  }

  // Nothing usable in the query string. The tokens may be in the fragment,
  // which browsers preserve across a redirect when the target has none of its
  // own, so /auth/confirm receives it and finishes the job client-side.
  return NextResponse.redirect(
    `${origin}/auth/confirm?next=${encodeURIComponent(next)}`
  );
}
