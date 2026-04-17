import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("module_slug, lesson_slug")
    .eq("user_id", user.id);

  const completed = (progress ?? []).map(
    (r) => `${r.module_slug}/${r.lesson_slug}`
  );

  return NextResponse.json({ completed });
}
