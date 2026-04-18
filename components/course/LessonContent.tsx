import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "./mdx-components";

interface LessonContentProps {
  content: string;
}

export default function LessonContent({ content }: LessonContentProps) {
  return (
    <div className="prose prose-invert prose-slate max-w-none
      prose-headings:text-white prose-headings:font-bold
      prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
      prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
      prose-p:text-slate-300 prose-p:leading-relaxed
      prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-white
      prose-code:text-brand-300 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700 prose-pre:rounded-xl prose-pre:text-sm
      prose-blockquote:border-brand-500 prose-blockquote:text-slate-400 prose-blockquote:bg-slate-900/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1
      prose-ul:text-slate-300 prose-ol:text-slate-300
      prose-li:text-slate-300 prose-li:leading-relaxed
      prose-hr:border-slate-700
      prose-table:text-slate-300 prose-th:text-white prose-th:bg-slate-800 prose-td:border-slate-700 prose-th:border-slate-700">
      <MDXRemote source={content} components={mdxComponents} />
    </div>
  );
}
