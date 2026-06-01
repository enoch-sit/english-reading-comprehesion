"use client";

import { useEffect, useRef, useState } from "react";
import { GuidedQuestionCard } from "@/components/guided-question-card";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import type { LessonSubsection } from "@/lib/lesson-content";

type LessonWorkspaceQuestion = {
  id: string;
  label: string;
  title: string;
  prompt: string;
  options: string[];
  reflection: string;
  clueHint?: string;
  strategyHint?: string;
  walkthroughMarkdown?: string;
  answerSummary?: string;
  answerLetter?: string | null;
  highlightTerms?: string[];
};

type LessonSectionWorkspaceProps = {
  title: string;
  passage: LessonSubsection[];
  questions: LessonWorkspaceQuestion[];
};

export function LessonSectionWorkspace({ title, passage, questions }: LessonSectionWorkspaceProps) {
  const [activeHighlightTerms, setActiveHighlightTerms] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const passageContainerRef = useRef<HTMLDivElement | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (activeHighlightTerms.length === 0) {
      return;
    }

    const firstHighlight = passageContainerRef.current?.querySelector("mark.passage-highlight") as HTMLElement | null;
    firstHighlight?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeHighlightTerms]);

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setActiveHighlightTerms([]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setActiveHighlightTerms([]);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      {/* Left: Reading Passage */}
      <div
        ref={passageContainerRef}
        className={`worksheet-frame px-5 py-5 transition ${
          activeHighlightTerms.length > 0 ? "passage-frame-active" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-dashed border-(--line) pb-4">
          <div>
            <p className="section-label">Reading Passage</p>
            <h3 className="mt-2 text-xl font-bold text-slate-950">{title}</h3>
          </div>
          <span className="simple-chip px-3 py-1 text-xs font-semibold text-(--accent-deep)">
            {activeHighlightTerms.length > 0 ? "Clue highlighted" : "Exam style"}
          </span>
        </div>

        <div className="mt-5 space-y-5">
          {passage.map((subsection) => (
            <div key={subsection.id} className="space-y-3">
              <h4 className="text-lg font-bold text-slate-950">{subsection.title}</h4>
              <div className="worksheet-box px-4 py-4">
                <MarkdownRenderer content={subsection.content} highlightTerms={activeHighlightTerms} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Current Question + Navigation */}
      <div className="space-y-4">
        <div className="worksheet-frame px-5 py-4">
          <p className="section-label">Question {currentQuestionIndex + 1} of {questions.length}</p>
          <p className="mt-2 text-sm leading-6 text-(--muted)">
            Use a hint to light up the clue inside the passage, then answer one by one.
          </p>
        </div>

        {currentQuestion ? (
          <>
            <GuidedQuestionCard
              {...currentQuestion}
              onActivateHighlight={(terms) => setActiveHighlightTerms(terms)}
            />

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex-1 border border-(--line) bg-white px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50 transition hover:bg-(--accent-soft)"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex-1 border border-(--line) bg-(--accent-soft) px-4 py-2 text-sm font-semibold text-(--accent-deep) disabled:cursor-not-allowed disabled:opacity-50 transition hover:bg-orange-100"
              >
                Next →
              </button>
            </div>
          </>
        ) : (
          <div className="worksheet-box px-5 py-5 text-sm text-(--muted)">
            No separate question block is available for this section.
          </div>
        )}
      </div>
    </div>
  );
}
