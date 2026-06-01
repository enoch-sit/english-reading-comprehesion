import Link from "next/link";
import type { LessonSummary } from "@/lib/lesson-content";

type StudyDashboardProps = {
  lessons: LessonSummary[];
};

export function StudyDashboard({ lessons }: StudyDashboardProps) {
  const totalQuestions = lessons.reduce((total, lesson) => total + lesson.questionCount, 0);
  const totalMinutes = lessons.reduce((total, lesson) => total + lesson.estimatedMinutes, 0);
  const focusSet = Array.from(new Set(lessons.flatMap((lesson) => lesson.studyFocuses))).slice(0, 5);
  const firstGuidedPaper = lessons.find((lesson) => lesson.questionCount > 0) ?? lessons[0];

  return (
    <section className="grid gap-6">
      <div className="worksheet-frame overflow-hidden">
        <div className="space-y-6 px-5 py-5 lg:px-6 lg:py-6">
          <div className="address-bar px-4 py-2 text-sm">www.readingcomprehensionexam.com</div>
          <div className="space-y-4">
            <p className="section-label">Guided Reading Comprehension App</p>
            <h1 className="paper-title max-w-4xl text-4xl sm:text-5xl">
              Train students to read exam papers with a clear process.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-(--muted)">
              This app now treats your Word documents and screen captures as exam papers. Each paper is broken into preview prompts, reading passages, separated questions, and review guidance so students can practice method, not just content.
            </p>
          </div>

          <div className="worksheet-dashed pt-5" />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Preview",
                description: "Warm up with paper structure, text type, and pre-reading cues.",
              },
              {
                title: "Read",
                description: "Study the passage separately and find the clue before answering.",
              },
              {
                title: "Answer",
                description: "Work through question cards one at a time in exam order.",
              },
              {
                title: "Review",
                description: "Use reference answers and think-aloud notes after the attempt.",
              },
            ].map((step, index) => (
              <div key={step.title} className="worksheet-box p-4">
                <p className="section-label">
                  Step {index + 1}
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-950">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-(--muted)">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={firstGuidedPaper ? `/lessons/${firstGuidedPaper.slug}` : "/"}
              className="border border-(--line) bg-(--accent-soft) px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#ffe6cf]"
            >
              Start guided practice
            </Link>
            <a
              href="/api/lessons"
              className="border border-(--line) bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-(--accent-soft)"
            >
              View paper API
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="worksheet-frame p-5">
          <p className="section-label">Papers indexed</p>
          <p className="mt-3 text-4xl font-bold">{lessons.length}</p>
          <p className="mt-2 text-sm leading-6 text-(--muted)">Each Markdown paper is converted into a guided reading-comprehension session.</p>
        </div>
        <div className="worksheet-frame p-5">
          <p className="section-label">Questions available</p>
          <p className="mt-3 text-4xl font-bold">{totalQuestions}</p>
          <p className="mt-2 text-sm leading-6 text-(--muted)">Questions stay separate from passages to match the exam-paper feel.</p>
        </div>
        <div className="worksheet-frame p-5">
          <p className="section-label">Guided time</p>
          <p className="mt-3 text-4xl font-bold">{totalMinutes} min</p>
          <p className="mt-2 text-sm leading-6 text-(--muted)">Estimated guided practice time across the current paper set.</p>
        </div>
        <div className="worksheet-frame p-5">
          <p className="section-label">Focus skills</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {focusSet.map((focus) => (
              <span
                key={focus}
                className="simple-chip px-3 py-1 text-xs font-medium"
              >
                {focus}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}