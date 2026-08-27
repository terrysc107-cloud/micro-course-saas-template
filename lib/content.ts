import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getModuleMeta } from "@/lib/course-config";
import type { LessonTrack, TrackId } from "@/lib/course-config";

const MODULES_DIR = path.join(process.cwd(), "content", "modules");

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number; // 0-indexed correct answer
}

export interface LessonFrontmatter {
  title: string;
  description: string;
  order: number;
  duration: string;
  /**
   * Which path this lesson is on. Required in every .mdx file and validated by
   * scripts/check-content.mjs, which fails the build on a missing or invalid
   * value.
   */
  track: LessonTrack;
  /** Plain-language prerequisite, rendered above the lesson body when present. */
  prerequisite?: string;
  videoUrl?: string;
  coverImage?: string;
  quiz: QuizQuestion[];
}

/**
 * FAIL OPEN AT RUNTIME, FAIL CLOSED AT BUILD.
 *
 * matter().data is an unchecked cast, so a lesson missing its `track` key is
 * `undefined` here rather than a type error. Treating that as "both" means the
 * worst case of a bad frontmatter slip is that a paying customer sees a lesson
 * they were not targeted with. The opposite default would silently hide bought
 * content, which is a much worse failure. The build-time check is what actually
 * enforces the field.
 */
function lessonTrack(fm: LessonFrontmatter | undefined): LessonTrack {
  return fm?.track ?? "both";
}

/** A lesson is in a track if it is on that path or on both. No track = everything. */
export function isInTrack(fm: LessonFrontmatter | undefined, track?: TrackId): boolean {
  if (!track) return true;
  const t = lessonTrack(fm);
  return t === "both" || t === track;
}

export interface Lesson {
  moduleSlug: string;
  lessonSlug: string;
  frontmatter: LessonFrontmatter;
  content: string;
}

export interface Module {
  slug: string;
  title: string;
  description: string;
  order: number;
  lessons: Omit<Lesson, "content">[];
}

function getModuleFolders(): string[] {
  if (!fs.existsSync(MODULES_DIR)) return [];
  return fs
    .readdirSync(MODULES_DIR)
    .filter((f) => fs.statSync(path.join(MODULES_DIR, f)).isDirectory())
    .sort();
}

function getLessonFiles(moduleFolder: string): string[] {
  const dir = path.join(MODULES_DIR, moduleFolder);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .sort();
}

function slugify(filename: string) {
  return filename.replace(/^\d+-/, "").replace(/\.mdx$/, "");
}

/** Falls back to a title derived from the folder name when a module has no
 *  entry in MODULE_META, so a newly added folder still renders. */
function moduleTitle(folder: string) {
  const meta = getModuleMeta(folder);
  if (meta) return meta.title;
  return folder
    .replace(/^\d+-/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function moduleOrder(folder: string) {
  const m = folder.match(/^(\d+)/);
  return m ? parseInt(m[1]) : 99;
}

/**
 * All modules, optionally filtered to one track.
 *
 * Called with no argument this returns exactly what it always has, so every
 * existing caller is unaffected. With a track, lessons are filtered and modules
 * left with nothing are dropped entirely, so a board learner's sidebar is short
 * and honest rather than a list of empty shells.
 */
export function getAllModules(track?: TrackId): Module[] {
  return getModuleFolders().map((folder) => {
    const lessonFiles = getLessonFiles(folder);
    const lessons = lessonFiles.map((file) => {
      const raw = fs.readFileSync(path.join(MODULES_DIR, folder, file), "utf8");
      const { data } = matter(raw);
      return {
        moduleSlug: folder,
        lessonSlug: slugify(file),
        frontmatter: data as LessonFrontmatter,
      };
    });
    return {
      slug: folder,
      title: moduleTitle(folder),
      description: getModuleMeta(folder)?.description ?? "",
      order: moduleOrder(folder),
      lessons: lessons.filter((l) => isInTrack(l.frontmatter, track)),
    };
  })
  .filter((m) => m.lessons.length > 0);
}

export function getLesson(moduleSlug: string, lessonSlug: string): Lesson | null {
  const folder = path.join(MODULES_DIR, moduleSlug);
  if (!fs.existsSync(folder)) return null;

  const files = getLessonFiles(moduleSlug);
  const file = files.find((f) => slugify(f) === lessonSlug);
  if (!file) return null;

  const raw = fs.readFileSync(path.join(folder, file), "utf8");
  const { data, content } = matter(raw);

  return {
    moduleSlug,
    lessonSlug,
    frontmatter: data as LessonFrontmatter,
    content,
  };
}

export function getAllLessons(track?: TrackId): Omit<Lesson, "content">[] {
  return getAllModules(track).flatMap((m) => m.lessons);
}

/**
 * Prev/next within a track, so each path has its own beginning and its own
 * ending. The board path ending is what makes the ladder upsell fire at the
 * right moment.
 */
export function getAdjacentLessons(
  moduleSlug: string,
  lessonSlug: string,
  track?: TrackId
) {
  const all = getAllLessons(track);
  const idx = all.findIndex(
    (l) => l.moduleSlug === moduleSlug && l.lessonSlug === lessonSlug
  );
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
