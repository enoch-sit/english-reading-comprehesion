"use client";

import { useMemo, useState } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";

type GuidedQuestionCardProps = {
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
  onActivateHighlight?: (terms: string[]) => void;
};

function normalizeOptionLabel(option: string) {
  const match = option.match(/^[-*]?\s*([A-D])\./i);
  return match?.[1]?.toUpperCase() ?? null;
}

export function GuidedQuestionCard({
  label,
  title,
  prompt,
  options,
  reflection,
  clueHint,
  strategyHint,
  walkthroughMarkdown,
  answerSummary,
  answerLetter,
  highlightTerms = [],
  onActivateHighlight,
}: GuidedQuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [checkedAnswer, setCheckedAnswer] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  const optionEntries = useMemo(
    () =>
      options.map((option) => ({
        raw: option,
        label: normalizeOptionLabel(option),
      })),
    [options],
  );

  const isCorrect = selectedOption && answerLetter ? selectedOption === answerLetter : null;

  return (
    <article className="worksheet-frame p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-label">{label}</p>
          <h4 className="mt-2 text-lg font-bold text-slate-950">{title}</h4>
        </div>
        <span className="simple-chip px-3 py-1 text-xs font-semibold text-slate-700">
          Scaffolded practice
        </span>
      </div>

      <div className="mt-4 worksheet-box px-4 py-4">
        <MarkdownRenderer content={prompt} />
      </div>

      {optionEntries.length > 0 ? (
        <div className="mt-4 space-y-3">
          <p className="section-label">Choose an answer</p>
          <div className="grid gap-3">
            {optionEntries.map((option) => {
              const isSelected = selectedOption === option.label;

              return (
                <button
                  key={option.raw}
                  type="button"
                  onClick={() => {
                    if (option.label) {
                      setSelectedOption(option.label);
                      setCheckedAnswer(false);
                    }
                  }}
                  className={`text-left ${
                    isSelected ? "bg-(--accent-soft)" : "bg-white"
                  } worksheet-box px-4 py-3 transition hover:bg-(--accent-soft)`}
                >
                  <span className="font-semibold text-(--accent-deep)">{option.raw}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setCheckedAnswer(true)}
              disabled={!selectedOption}
              className="border border-(--line) bg-(--accent-soft) px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Check answer
            </button>
            <button
              type="button"
              onClick={() => {
                setHintLevel((current) => {
                  const nextLevel = Math.min(current + 1, 3);

                  if (nextLevel >= 1 && highlightTerms.length > 0) {
                    onActivateHighlight?.(highlightTerms);
                  }

                  return nextLevel;
                });
              }}
              className="border border-(--line) bg-white px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Show next hint
            </button>
          </div>

          {checkedAnswer ? (
            <div className="worksheet-box px-4 py-3 text-sm text-slate-800">
              {answerLetter ? (
                <p>
                  {isCorrect ? "Correct." : "Not quite."} The guided answer is <strong>{answerLetter}</strong>
                  {answerSummary ? `: ${answerSummary}` : "."}
                </p>
              ) : (
                <p>{answerSummary || "Use the walkthrough below to check your reasoning."}</p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {(clueHint || strategyHint || walkthroughMarkdown || reflection) ? (
        <div className="mt-5 space-y-3">
          <p className="section-label">Hints and guidance</p>

          {hintLevel >= 1 && clueHint ? (
            <div className="worksheet-box px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--accent-deep)">Hint 1: Find the clue</p>
              <p className="mt-2 text-sm leading-7 text-(--muted)">{clueHint}</p>
            </div>
          ) : null}

          {hintLevel >= 2 && strategyHint ? (
            <div className="worksheet-box px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--accent-deep)">Hint 2: Strategy</p>
              <p className="mt-2 text-sm leading-7 text-(--muted)">{strategyHint}</p>
            </div>
          ) : null}

          {hintLevel >= 3 && walkthroughMarkdown ? (
            <div className="worksheet-box px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--accent-deep)">Hint 3: Worked thinking</p>
              <div className="mt-2">
                <MarkdownRenderer content={walkthroughMarkdown} />
              </div>
            </div>
          ) : null}

          {reflection ? (
            <div className="worksheet-box px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--accent-deep)">After you answer</p>
              <p className="mt-2 text-sm leading-7 text-(--muted)">{reflection}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}