import Stripe from "stripe";

/**
 * Stripe config is resolved lazily and validated explicitly.
 *
 * The previous version ran `new Stripe(process.env.STRIPE_SECRET_KEY!)` at
 * module scope, which meant a missing key threw an opaque constructor error the
 * first time the module was imported — including during `next build`. Worse, the
 * `!` assertions hid the failure from TypeScript entirely, so a misconfigured
 * deploy surfaced as a 500 at checkout rather than at startup.
 */

const API_VERSION = "2026-03-25.dahlia";

export class StripeConfigError extends Error {
  constructor(missing: string[]) {
    super(`Missing required Stripe configuration: ${missing.join(", ")}`);
    this.name = "StripeConfigError";
  }
}

function requireEnv(names: string[]): Record<string, string> {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length > 0) throw new StripeConfigError(missing);
  return Object.fromEntries(names.map((n) => [n, process.env[n] as string]));
}

let client: Stripe | null = null;

/** Throws StripeConfigError if STRIPE_SECRET_KEY is absent. */
export function getStripe(): Stripe {
  if (!client) {
    const { STRIPE_SECRET_KEY } = requireEnv(["STRIPE_SECRET_KEY"]);
    client = new Stripe(STRIPE_SECRET_KEY, { apiVersion: API_VERSION });
  }
  return client;
}

/** Everything the checkout route needs. Throws if any piece is missing. */
export function getCheckoutConfig() {
  const env = requireEnv([
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PRICE_ID",
    "NEXT_PUBLIC_SITE_URL",
  ]);
  return {
    priceId: env.NEXT_PUBLIC_STRIPE_PRICE_ID,
    siteUrl: env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ""),
  };
}

/**
 * Everything the Build Lab checkout route needs. Throws if any piece is missing.
 *
 * Separate from getCheckoutConfig on purpose. The Lab has its own price id, and
 * a deploy with no Lab price must fail the Lab checkout only — never the $97
 * course checkout, which is live and selling.
 */
export function getLabCheckoutConfig() {
  const env = requireEnv([
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_BUILD_LAB_PRICE_ID",
    "NEXT_PUBLIC_SITE_URL",
  ]);
  return {
    priceId: env.NEXT_PUBLIC_STRIPE_BUILD_LAB_PRICE_ID,
    siteUrl: env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ""),
  };
}

/** Everything the webhook route needs. Throws if any piece is missing. */
export function getWebhookConfig() {
  const env = requireEnv([
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]);
  return { webhookSecret: env.STRIPE_WEBHOOK_SECRET };
}
