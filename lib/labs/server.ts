import "server-only";
import { createHash } from "node:crypto";
import { createClient, createServiceClient } from "@/lib/supabase/server";

import type { Application, Cohort } from "./types";
export type { Application, Cohort } from "./types";
export { ownerApplication } from "./privacy";

export class LabError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function labsConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}
export async function labUser() {
  if (!labsConfigured())
    throw new LabError(
      "Your workspace is being prepared. Please try again later.",
      503,
    );
  const {
    data: { user },
    error,
  } = await (await createClient()).auth.getUser();
  if (error || !user) throw new LabError("Sign in to continue.", 401);
  return user;
}
export function isInstructor(id: string) {
  return (process.env.LAB_INSTRUCTOR_USER_IDS ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .includes(id);
}
export async function instructor() {
  const user = await labUser();
  if (!isInstructor(user.id))
    throw new LabError("Instructor access required.", 403);
  return user;
}
export function checkDb(error: { message: string } | null) {
  if (error) {
    console.error("[labs] database operation failed");
    throw new LabError("We could not save that change. Please try again.", 503);
  }
}
export async function jsonBody(request: Request) {
  const origin = request.headers.get("origin");
  // Next can reconstruct request.url with an internal hostname behind a proxy.
  // SITE_URL is the deployment's trusted public origin (also set on previews).
  const expectedOrigin = new URL(
    process.env.NEXT_PUBLIC_SITE_URL || request.url,
  ).origin;
  if (!origin || origin !== expectedOrigin)
    throw new LabError("Refresh the page and try again.", 403);
  const raw = await request.text();
  if (raw.length > 180000)
    throw new LabError("This submission is too large.", 413);
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new LabError("Please submit a valid form.");
  }
}
export async function rateLimit(key: string, limit = 30, seconds = 3600) {
  const hash = createHash("sha256").update(key).digest("hex");
  const { data, error } = await createServiceClient().rpc("ccc_bl_rate_limit", {
    p_key: hash,
    p_limit: limit,
    p_seconds: seconds,
  });
  checkDb(error);
  if (!data) throw new LabError("Please wait before trying again.", 429);
}
export async function ownedApplication(id: unknown, userId: string) {
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id))
    throw new LabError("Choose an application.");
  const { data, error } = await createServiceClient()
    .from("ccc_bl_applications")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  checkDb(error);
  if (!data) throw new LabError("Application not found.", 404);
  return data as Application;
}
export async function paidApplication(id: unknown, userId: string) {
  const app = await ownedApplication(id, userId);
  const { data, error } = await createServiceClient()
    .from("ccc_bl_enrollments")
    .select("id")
    .eq("application_id", app.id)
    .eq("user_id", userId)
    .eq("status", "paid")
    .maybeSingle();
  checkDb(error);
  if (!data) throw new LabError("Enrollment is required for this step.", 403);
  return app;
}
export async function publicCohorts(): Promise<Cohort[]> {
  if (!labsConfigured()) return [];
  const { data, error } = await createServiceClient()
    .from("ccc_bl_cohorts")
    .select(
      "id,slug,program_slug,title,status,capacity,price_cents,currency,starts_at,timezone,session_dates,terms",
    )
    .in("status", ["applications_open", "enrollment_open"])
    .order("created_at");
  if (error) return [];
  return (data ?? []) as Cohort[];
}
export function labResponseError(error: unknown) {
  if (error instanceof LabError)
    return Response.json({ error: error.message }, { status: error.status });
  console.error("[labs] request failed");
  return Response.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
