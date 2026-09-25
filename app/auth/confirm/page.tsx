import { safeRedirect } from "@/lib/labs/intake";
import HashSession from "./HashSession";

/**
 * Fragment-form auth links land here from /auth/callback.
 *
 * A separate page exists because the token lives in the URL fragment, which is
 * never sent to the server, so only the browser can read it.
 */
export const dynamic = "force-dynamic";

export default async function ConfirmPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  const next = safeRedirect(raw);
  return <HashSession next={next} />;
}
