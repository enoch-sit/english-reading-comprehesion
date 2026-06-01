import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LessonSectionWorkspace } from "@/components/lesson-section-workspace";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import type { LessonQuestion, LessonSection, LessonSubsection } from "@/lib/lesson-content";
import { getLessonBySlug, getLessons } from "@/lib/lesson-content";

type LessonPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const lessons = await getLessons();
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);

  if (!lesson) {
    return {
      title: "Lesson Not Found",
    };
  }

  return {
    title: `${lesson.title} | Reading Comprehension Studio`,
    description: lesson.description,
  };
}

type ParsedQuestionContent = {
  prompt: string;
  options: string[];
  reflection: string;
};

function parseQuestionContent(content: string): ParsedQuestionContent {
  const lines = content.split("\n").map((line) => line.trimEnd());
  const promptLines: string[] = [];
  const optionLines: string[] = [];
  const reflectionLines: string[] = [];
  let mode: "prompt" | "options" | "reflection" = "prompt";

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (mode === "reflection") {
        reflectionLines.push(line);
      } else if (mode === "options") {
        reflectionLines.push(line);
      } else {
        promptLines.push(line);
      }
      continue;
    }

    if (/^[-*]?\s*[A-D]\./i.test(trimmed)) {
      mode = "options";
      optionLines.push(trimmed.replace(/^[-*]\s*/, ""));
      continue;
    }

    if (mode === "options") {
      mode = "reflection";
    }

    if (mode === "reflection") {
      reflectionLines.push(trimmed);
    } else {
      promptLines.push(trimmed);
    }
  }

  return {
    prompt: promptLines.join("\n").trim(),
    options: optionLines,
    reflection: reflectionLines.join(" ").trim(),
  };
}

function extractSupportChunk(content: string, questionTitle: string) {
  const escapedTitle = questionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^#{3,6}\\s+${escapedTitle}\\s*$([\\s\\S]*?)(?=^#{3,6}\\s+|$)`, "im");
  const match = content.match(pattern);
  return match?.[1]?.trim() ?? "";
}

function extractReferenceAnswer(referenceContent: string, indexWithinSection: number) {
  const items = Array.from(referenceContent.matchAll(/^\s*\d+\.\s+(.+)$/gm)).map((match) => match[1].trim());
  return items[indexWithinSection] ?? "";
}

function extractAnswerLetter(markdown: string) {
  const match = markdown.match(/\b([A-D])\b\s+is the best answer\b/i) || markdown.match(/\b([A-D])\s+is the best answer\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function extractStrategyHint(markdown: string) {
  const sentences = markdown
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return sentences.slice(0, 2).join(" ");
}

function sanitizeHighlightTerm(value: string) {
  return value
    .replace(/^['"“”‘’(\[]+/, "")
    .replace(/['"“”‘’)\].,:;!?]+$/, "")
    .replace(/[*_`]/g, "")
    .trim();
}

function extractHighlightTerms(...sources: Array<string | undefined>) {
  const collected = new Set<string>();
  const patterns = [
    /["“”'‘’]([^"“”'‘’]{3,90})["“”'‘’]/g,
    /(?:\*\*|__|\*|_)([^*_]{3,90})(?:\*\*|__|\*|_)/g,
    /\b\d{1,2}\s*[–-]\s*\d{1,2}\s+[A-Za-z]+\b/g,
    /\b[a-z]+(?:\s+[a-z]+){1,6}!/gi,
  ];

  for (const source of sources) {
    if (!source) {
      continue;
    }

    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        const rawTerm = match[1] ?? match[0];
        const cleanedTerm = sanitizeHighlightTerm(rawTerm);

        if (cleanedTerm.length >= 3 && cleanedTerm.length <= 90) {
          collected.add(cleanedTerm);
        }
      }
    }
  }

  return Array.from(collected);
}

function buildQuestionScaffold(section: LessonSection, question: LessonQuestion, indexWithinSection: number) {
  const parsed = parseQuestionContent(question.content);
  const thinkAloud = section.support.find((support) => support.title.toLowerCase().includes("think aloud"));
  const referenceAnswers = section.support.find((support) => support.title.toLowerCase().includes("reference answers"));
  const walkthroughMarkdown = thinkAloud ? extractSupportChunk(thinkAloud.content, question.title) : "";
  const answerSummary = referenceAnswers ? extractReferenceAnswer(referenceAnswers.content, indexWithinSection) : "";

  return {
    ...parsed,
    clueHint: parsed.prompt || undefined,
    strategyHint: walkthroughMarkdown ? extractStrategyHint(walkthroughMarkdown) : undefined,
    walkthroughMarkdown: walkthroughMarkdown || undefined,
    answerSummary: answerSummary || undefined,
    answerLetter: walkthroughMarkdown ? extractAnswerLetter(walkthroughMarkdown) : null,
    highlightTerms: extractHighlightTerms(parsed.prompt, walkthroughMarkdown, answerSummary),
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="worksheet-frame overflow-hidden">
        <div className="space-y-5 px-5 py-5 lg:px-6 lg:py-6">
          <div className="address-bar px-4 py-2 text-sm">www.happyicecream.com.hk</div>
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <Link
              href="/"
              className="section-label text-(--accent-deep)"
            >
              Back to paper bank
            </Link>
            <h1 className="paper-title mt-4 max-w-3xl text-4xl sm:text-5xl">
              {lesson.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-(--muted)">
              {lesson.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="simple-chip px-3 py-1 text-xs font-semibold text-(--accent-deep)">
                {lesson.paperType}
              </span>
              {lesson.studyFocuses.map((focus) => (
                <span
                  key={`${lesson.slug}-${focus}`}
                  className="simple-chip px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {focus}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="worksheet-box p-5">
              <p className="section-label">Guided time</p>
              <p className="mt-2 text-3xl font-bold">{lesson.estimatedMinutes} min</p>
            </div>
            <div className="worksheet-box p-5">
              <p className="section-label">Questions</p>
              <p className="mt-2 text-3xl font-bold">{lesson.questionCount}</p>
            </div>
            <div className="worksheet-box p-5">
              <p className="section-label">Sections</p>
              <p className="mt-2 text-3xl font-bold">{lesson.sectionCount}</p>
            </div>
          </div>
        </div>
        <div className="worksheet-dashed" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {lesson.studySteps.map((step, index) => (
          <article
            key={step.id}
            className="worksheet-frame p-5"
          >
            <p className="section-label">
              Step {index + 1}
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">{step.title}</h2>
            <p className="mt-3 text-sm leading-7 text-(--muted)">{step.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="worksheet-frame h-fit p-5 lg:sticky lg:top-6">
          <p className="section-label">
            Jump to section
          </p>
          <nav className="mt-4 space-y-2">
            {lesson.sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="worksheet-box block px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-(--accent-soft)"
              >
                <span className="mr-2 text-(--accent)">{String(index + 1).padStart(2, "0")}</span>
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-5">
          {lesson.sections.map((section, index) => (
            <details
              key={section.id}
              id={section.id}
              open={index === 0}
              className="worksheet-frame overflow-hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left">
                <div>
                  <p className="section-label">
                    Section {index + 1}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{section.title}</h2>
                </div>
                <span className="simple-chip px-3 py-1 text-xs font-semibold text-slate-700">
                  Tap to toggle
                </span>
              </summary>

              <div className="border-t border-dashed border-(--line) px-6 py-6 md:px-8">
                <div className="space-y-6">
                  {section.intro ? (
                    <div className="worksheet-box px-5 py-4">
                      <p className="section-label text-(--accent-deep)">
                        Section Introduction
                      </p>
                      <div className="mt-3">
                        <MarkdownRenderer content={section.intro} />
                      </div>
                    </div>
                  ) : null}

                  {section.preReading.length > 0 ? (
                    <div className="worksheet-frame px-5 py-5">
                      <p className="section-label">
                        Pre-reading
                      </p>
                      <div className="mt-4 space-y-4">
                        {section.preReading.map((subsection) => (
                          <div key={subsection.id} className="worksheet-box px-4 py-4">
                            <h3 className="text-lg font-bold text-slate-900">{subsection.title}</h3>
                            <div className="mt-3">
                              <MarkdownRenderer content={subsection.content} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {(section.passage.length > 0 || section.questions.length > 0) ? (
                    <LessonSectionWorkspace
                      title={section.title}
                      passage={section.passage}
                      questions={section.questions.map((question, questionIndex) => ({
                        id: question.id,
                        label: question.number ? `Question ${question.number}` : `Question ${questionIndex + 1}`,
                        title: question.title,
                        ...buildQuestionScaffold(section, question, questionIndex),
                      }))}
                    />
                  ) : null}

                  {section.support.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <p className="section-label text-(--accent-deep)">
                          Review Notes
                        </p>
                        <h3 className="mt-2 text-xl font-bold text-slate-950">
                          Answers and teacher support
                        </h3>
                      </div>

                      {section.support.map((subsection) => (
                        <details
                          key={subsection.id}
                          className="worksheet-frame"
                        >
                          <summary className="cursor-pointer list-none px-5 py-4 text-base font-bold text-slate-900">
                            {subsection.title}
                          </summary>
                          <div className="border-t border-dashed border-(--line) px-5 py-5">
                            <MarkdownRenderer content={subsection.content} />
                          </div>
                        </details>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}