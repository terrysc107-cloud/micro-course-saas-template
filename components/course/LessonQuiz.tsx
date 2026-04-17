"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import type { QuizQuestion } from "@/lib/content";

interface LessonQuizProps {
  moduleSlug: string;
  lessonSlug: string;
  questions: QuizQuestion[];
  nextLesson: { moduleSlug: string; lessonSlug: string } | null;
  alreadyPassed: boolean;
}

interface QuizResult {
  score: number;
  passed: boolean;
  correct: boolean[];
}

export default function LessonQuiz({
  moduleSlug,
  lessonSlug,
  questions,
  nextLesson,
  alreadyPassed,
}: LessonQuizProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);

  if (alreadyPassed) {
    return (
      <div className="mt-10 rounded-xl border border-green-700/50 bg-green-900/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-400" />
          <h3 className="text-lg font-semibold text-green-300">Quiz Passed</h3>
        </div>
        <p className="text-slate-400 text-sm mb-4">You&apos;ve already passed this quiz.</p>
        {nextLesson && (
          <button
            onClick={() => router.push(`/learn/${nextLesson.moduleSlug}/${nextLesson.lessonSlug}`)}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Next Lesson <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  async function handleSubmit() {
    if (selected.some((s) => s === null)) return;
    setSubmitting(true);

    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleSlug, lessonSlug, answers: selected }),
    });

    const data = await res.json();
    setResult(data);
    setAttempts((a) => a + 1);
    setSubmitting(false);

    if (data.passed) {
      router.refresh(); // update sidebar checkmarks
    }
  }

  function handleRetry() {
    setResult(null);
    setSelected(new Array(questions.length).fill(null));
  }

  const allAnswered = selected.every((s) => s !== null);

  return (
    <div className="mt-10">
      <div className="border-t border-slate-800 pt-8">
        <h3 className="text-xl font-bold text-white mb-2">Knowledge Check</h3>
        <p className="text-slate-400 text-sm mb-6">
          Answer all questions correctly (70%+) to unlock the next lesson.
        </p>

        <div className="space-y-6">
          {questions.map((q, qi) => (
            <div key={qi} className="bg-slate-900 rounded-xl p-5 border border-slate-800">
              <p className="text-white font-medium mb-4">
                <span className="text-slate-500 text-sm mr-2">{qi + 1}.</span>
                {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = selected[qi] === oi;
                  const isCorrect = result?.correct[qi] !== undefined && q.answer === oi;
                  const isWrong = result && isSelected && !result.correct[qi];

                  return (
                    <button
                      key={oi}
                      disabled={!!result}
                      onClick={() => {
                        if (result) return;
                        const next = [...selected];
                        next[qi] = oi;
                        setSelected(next);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg text-sm border transition-all",
                        result
                          ? isCorrect
                            ? "border-green-500 bg-green-900/20 text-green-300"
                            : isWrong
                            ? "border-red-500 bg-red-900/20 text-red-300"
                            : "border-slate-700 text-slate-500"
                          : isSelected
                          ? "border-brand-500 bg-brand-600/20 text-white"
                          : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {result ? (
                          isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                          ) : isWrong ? (
                            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 shrink-0" />
                          )
                        ) : (
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border-2 shrink-0 transition-colors",
                              isSelected ? "border-brand-500 bg-brand-500" : "border-slate-600"
                            )}
                          />
                        )}
                        {opt}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Score + actions */}
        {result ? (
          <div
            className={cn(
              "mt-6 rounded-xl p-5 border",
              result.passed
                ? "border-green-700/50 bg-green-900/20"
                : "border-red-700/50 bg-red-900/20"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={cn(
                    "text-lg font-bold",
                    result.passed ? "text-green-300" : "text-red-300"
                  )}
                >
                  {result.passed ? "Passed!" : "Not quite."}{" "}
                  <span className="font-normal text-base">{result.score}% correct</span>
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {result.passed
                    ? "Lesson complete. You can move on to the next lesson."
                    : attempts >= 2
                    ? "Review the highlighted answers above and try again."
                    : "Keep going — you need 70% to pass."}
                </p>
              </div>
              {result.passed && nextLesson ? (
                <button
                  onClick={() =>
                    router.push(`/learn/${nextLesson.moduleSlug}/${nextLesson.lessonSlug}`)
                  }
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors ml-4 shrink-0"
                >
                  Next Lesson <ChevronRight className="w-4 h-4" />
                </button>
              ) : !result.passed ? (
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors ml-4 shrink-0"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="mt-6 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Checking..." : "Submit Answers"}
          </button>
        )}
      </div>
    </div>
  );
}
