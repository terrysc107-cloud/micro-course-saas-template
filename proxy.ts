import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/auth/callback",
  "/api/stripe/webhook",
];

const PROTECTED_ROUTES = ["/dashboard", "/learn"];

function isPublic(pathname: string) {
  return PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
}

function isProtected(pathname: string) {
  return PROTECTED_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Session client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not signed in → sign-in
  if (!user) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check purchase via service role
  const { createClient } = await import("@supabase/supabase-js");
  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: purchase } = await serviceSupabase
    .from("course_purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!purchase) {
    // No purchase → landing page with upgrade prompt
    return NextResponse.redirect(new URL("/?upgrade=true", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
