import fs from "fs";
import path from "path";
import matter from "gray-matter";

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
  videoUrl?: string;
  coverImage?: string;
  quiz: QuizQuestion[];
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

function moduleTitle(folder: string) {
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

export function getAllModules(): Module[] {
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
      order: moduleOrder(folder),
      lessons,
    };
  });
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

export function getAllLessons(): Omit<Lesson, "content">[] {
  const modules = getAllModules();
  return modules.flatMap((m) => m.lessons);
}

export function getAdjacentLessons(moduleSlug: string, lessonSlug: string) {
  const all = getAllLessons();
  const idx = all.findIndex(
    (l) => l.moduleSlug === moduleSlug && l.lessonSlug === lessonSlug
  );
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
