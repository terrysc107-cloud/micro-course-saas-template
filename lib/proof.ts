import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { getAllModules, getAllLessons } from "@/lib/content";
import { LAST_VERIFIED } from "@/lib/course-config";

/**
 * Numbers for the public proof dashboard.
 *
 * THE ONE RULE: every number here is counted from a table or derived from the
 * filesystem. Nothing is typed by hand, estimated, rounded up, or "illustrative".
 * A build-in-public dashboard whose numbers are decorative is worse than no
 * dashboard, because the whole point is that these are the real ones.
 *
 * When a count cannot be read, it returns null and the UI renders "not
 * available" rather than a zero. A zero and a failed query look identical to a
 * reader and mean opposite things.
 *
 * Service role is used because these are aggregate counts over tables whose RLS
 * (correctly) confines a normal client to its own rows. Only counts leave this
 * module. No user, email, or row content is ever returned.
 */

export interface ProofMetric {
  label: string;
  value: number | null;
  /** What the number literally counts, so a reader can check our work. */
  basis: string;
}

export interface ProofSnapshot {
  metrics: ProofMetric[];
  /** ISO timestamp of the read. Rendered so the page can never look staler than it is. */
  readAt: string;
  curriculumVerified: string;
}

async function countRows(table: string): Promise<number | null> {
  try {
    const supabase = createServiceClient();
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    if (error) {
      console.error(`[proof] count failed for ${table}:`, error.message);
      return null;
    }
    return count ?? null;
  } catch (err) {
    console.error(`[proof] count threw for ${table}:`, err);
    return null;
  }
}

export async function getProofSnapshot(): Promise<ProofSnapshot> {
  const modules = getAllModules();
  const lessons = getAllLessons();

  const [purchases, lessonsCompleted, labWaitlist] = await Promise.all([
    countRows("course_purchases"),
    countRows("lesson_progress"),
    countRows("ccc_lab_waitlist"),
  ]);

  return {
    readAt: new Date().toISOString(),
    curriculumVerified: LAST_VERIFIED,
    metrics: [
      {
        label: "Lessons published",
        value: lessons.length,
        basis: "MDX files under content/modules, counted at build",
      },
      {
        label: "Modules",
        value: modules.length,
        basis: "Module folders with a MODULE_META entry",
      },
      {
        label: "Students enrolled",
        value: purchases,
        basis: "Rows in course_purchases. One per person, ever.",
      },
      {
        label: "Lessons completed",
        value: lessonsCompleted,
        basis: "Rows in lesson_progress across all students",
      },
      {
        label: "On the Build Lab list",
        value: labWaitlist,
        basis: "Rows in ccc_lab_waitlist. Not a seat count and not a sale.",
      },
    ],
  };
}
