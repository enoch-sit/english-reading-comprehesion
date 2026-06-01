"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import type { LessonSummary } from "@/lib/lesson-content";

type LessonCatalogProps = {
  lessons: LessonSummary[];
};

export function LessonCatalog({ lessons }: LessonCatalogProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredLessons = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return lessons;
    }

    return lessons.filter((lesson) => {
      const searchText = [lesson.title, lesson.description, ...lesson.sectionTitles]
        .join(" ")
        .toLowerCase();

      return searchText.includes(normalizedQuery);
    });
  }, [deferredQuery, lessons]);

  return (
    <section className="space-y-6">
      <div className="worksheet-frame flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="section-label">
            Exam Paper Bank
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Search by paper title, skill focus, or guided stage
          </h2>
        </div>
        <label className="block w-full max-w-md">
          <span className="sr-only">Search lessons</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try 'inference', 'overview', or 'part 1'"
            className="w-full border border-(--line) bg-white px-5 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-(--accent)"
          />
        </label>
      </div>

      <div className="flex items-center justify-between text-sm text-(--muted)">
        <p>{filteredLessons.length} papers ready for guided study</p>
        <p>{lessons.reduce((total, lesson) => total + lesson.questionCount, 0)} separated questions indexed</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {filteredLessons.map((lesson, index) => (
          <Link
            key={lesson.slug}
            href={`/lessons/${lesson.slug}`}
            className="group worksheet-frame p-6 transition duration-150 hover:bg-(--accent-soft)"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-label text-(--accent-deep)">
                  Paper {index + 1}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {lesson.title}
                </h3>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">
                  {lesson.paperType}
                </p>
              </div>
              <div className="simple-chip px-3 py-1 text-xs font-semibold text-slate-900">
                {lesson.questionCount} questions
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-(--muted)">{lesson.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {lesson.studyFocuses.map((focus) => (
                <span
                  key={`${lesson.slug}-${focus}`}
                  className="simple-chip px-3 py-1 text-xs font-semibold text-(--accent-deep)"
                >
                  {focus}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {lesson.sectionTitles.slice(0, 4).map((sectionTitle, sectionIndex) => (
                <span
                  key={`${lesson.slug}-${sectionTitle}-${sectionIndex}`}
                  className="simple-chip px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {sectionTitle}
                </span>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-dashed border-(--line) pt-4 text-sm text-slate-700">
              <span>{lesson.estimatedMinutes} min guided</span>
              <span className="font-semibold text-(--accent) transition group-hover:translate-x-1">
                Open paper
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}