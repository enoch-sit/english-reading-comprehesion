import { promises as fs } from "node:fs";
import path from "node:path";

const MATERIAL_DIR = process.env.LESSON_MATERIAL_DIR
  ? path.resolve(process.env.LESSON_MATERIAL_DIR)
  : path.join(process.cwd(), "..", "material");

export type LessonSection = {
  id: string;
  title: string;
  content: string;
  intro: string;
  preReading: LessonSubsection[];
  passage: LessonSubsection[];
  questions: LessonQuestion[];
  support: LessonSubsection[];
};

export type LessonSubsection = {
  id: string;
  title: string;
  content: string;
};

export type LessonQuestion = {
  id: string;
  title: string;
  number: number | null;
  content: string;
};

export type LessonStudyStep = {
  id: string;
  title: string;
  description: string;
};

export type LessonSummary = {
  slug: string;
  title: string;
  description: string;
  sectionTitles: string[];
  questionCount: number;
  wordCount: number;
  sectionCount: number;
  paperType: string;
  studyFocuses: string[];
  estimatedMinutes: number;
};

export type LessonDetail = LessonSummary & {
  content: string;
  sections: LessonSection[];
  studySteps: LessonStudyStep[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeWhitespace(value: string) {
  return value.replace(/\r/g, "").trim();
}

function detectHeadingLevel(content: string, minLevel = 2, maxLevel = 4) {
  const matches = Array.from(content.matchAll(/^(#{2,6})\s+/gm)).map((match) => match[1].length);
  const candidates = matches.filter((level) => level >= minLevel && level <= maxLevel);

  if (candidates.length === 0) {
    return null;
  }

  return Math.min(...candidates);
}

function parseMarkdownSubsections(content: string) {
  const normalized = normalizeWhitespace(content);
  const lines = normalized.split("\n");
  const introLines: string[] = [];
  const subsections: Array<{ title: string; content: string }> = [];
  let currentTitle: string | null = null;
  let currentLines: string[] = [];
  const headingLevel = detectHeadingLevel(normalized, 2, 4);

  if (!headingLevel) {
    return {
      intro: normalized,
      subsections,
    };
  }

  const headingPattern = new RegExp(`^#{${headingLevel}}\\s+(.+)$`);

  const flush = () => {
    if (!currentTitle) {
      return;
    }

    const subsectionContent = currentLines.join("\n").trim();

    subsections.push({
      title: currentTitle,
      content: subsectionContent,
    });

    currentLines = [];
  };

  for (const line of lines) {
    const match = line.match(headingPattern);

    if (match) {
      flush();
      currentTitle = match[1].trim();
      continue;
    }

    if (currentTitle) {
      currentLines.push(line);
    } else {
      introLines.push(line);
    }
  }

  flush();

  return {
    intro: introLines.join("\n").trim(),
    subsections,
  };
}

function parseQuestions(sectionTitle: string, content: string) {
  const normalized = normalizeWhitespace(content);
  const lines = normalized.split("\n");
  const questions: LessonQuestion[] = [];
  let currentTitle: string | null = null;
  let currentLines: string[] = [];
  const headingLevel = detectHeadingLevel(normalized, 3, 5);
  const headingPattern = headingLevel ? new RegExp(`^#{${headingLevel}}\\s+(.+)$`) : null;

  const flush = () => {
    if (!currentTitle) {
      return;
    }

    const index = questions.length;
    const numberMatch = currentTitle.match(/Question\s+(\d+)/i);

    questions.push({
      id: slugify(`${sectionTitle}-${currentTitle}-${index + 1}`),
      title: currentTitle,
      number: numberMatch ? Number(numberMatch[1]) : null,
      content: currentLines.join("\n").trim(),
    });

    currentLines = [];
  };

  for (const line of lines) {
    const match = headingPattern ? line.match(headingPattern) : null;

    if (match) {
      flush();
      currentTitle = match[1].trim();
      continue;
    }

    if (currentTitle) {
      currentLines.push(line);
    }
  }

  flush();

  if (questions.length === 0 && normalized) {
    questions.push({
      id: slugify(`${sectionTitle}-question-set`),
      title: "Question Set",
      number: null,
      content: normalized,
    });
  }

  return questions;
}

function derivePaperType(title: string, sections: LessonSection[]) {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("overview")) {
    return "Overview Paper";
  }

  if (sections.some((section) => /^part\s+\d+/i.test(section.title))) {
    return "Guided Practice Paper";
  }

  if (normalizedTitle.includes("summary")) {
    return "Review Paper";
  }

  return "Exam Practice Paper";
}

function deriveStudyFocuses(content: string, sections: LessonSection[]) {
  const normalized = content.toLowerCase();
  const focuses = new Set<string>();

  if (normalized.includes("skim")) {
    focuses.add("Skimming for gist");
  }

  if (normalized.includes("scan")) {
    focuses.add("Scanning for detail");
  }

  if (normalized.includes("infer")) {
    focuses.add("Inference skills");
  }

  if (normalized.includes("comments")) {
    focuses.add("Opinion and tone");
  }

  if (normalized.includes("special offer") || normalized.includes("webpage")) {
    focuses.add("Text structure clues");
  }

  if (sections.some((section) => section.questions.length > 0)) {
    focuses.add("Multiple-choice strategy");
  }

  if (focuses.size === 0) {
    focuses.add("Reading comprehension");
  }

  return Array.from(focuses).slice(0, 4);
}

function estimateMinutes(wordCount: number, questionCount: number, sectionCount: number) {
  return Math.max(8, Math.round(wordCount / 110) + questionCount * 2 + sectionCount);
}

function buildStudySteps(sections: LessonSection[]): LessonStudyStep[] {
  const hasPreReading = sections.some((section) => section.preReading.length > 0);
  const hasQuestions = sections.some((section) => section.questions.length > 0);
  const hasSupport = sections.some((section) => section.support.length > 0);

  return [
    hasPreReading
      ? {
          id: "preview",
          title: "Preview the paper",
          description: "Start with the pre-reading prompts to predict topic, structure, and key details before reading closely.",
        }
      : {
          id: "preview",
          title: "Preview the passage",
          description: "Look over the title, headings, and layout to decide what kind of text this exam paper is using.",
        },
    {
      id: "read",
      title: "Read with purpose",
      description: "Use the passage panel to spot clues, keywords, dates, and opinions before you move to the answer choices.",
    },
    hasQuestions
      ? {
          id: "answer",
          title: "Answer separately",
          description: "Tackle the question cards one at a time so the passage and the questions feel like a real exam paper.",
        }
      : {
          id: "answer",
          title: "Record your understanding",
          description: "Summarize what the paper is asking and what details matter most before moving on.",
        },
    hasSupport
      ? {
          id: "review",
          title: "Review the clues",
          description: "Open the review notes, reference answers, and think-aloud guidance after attempting the paper yourself.",
        }
      : {
          id: "review",
          title: "Reflect and improve",
          description: "Check which reading skills helped most and note what to watch for in the next paper.",
        },
  ];
}

function buildSection(title: string, content: string): LessonSection {
  const trimmedContent = normalizeWhitespace(content).replace(/^#\s+.+\n?/, "").trim();
  const { intro, subsections } = parseMarkdownSubsections(trimmedContent);
  const preReading: LessonSubsection[] = [];
  const passage: LessonSubsection[] = [];
  const support: LessonSubsection[] = [];
  let questions: LessonQuestion[] = [];

  for (const subsection of subsections) {
    const lowerTitle = subsection.title.toLowerCase();

    if (lowerTitle === "questions") {
      questions = parseQuestions(title, subsection.content);
      continue;
    }

    const subsectionEntry = {
      id: slugify(`${title}-${subsection.title}`),
      title: subsection.title,
      content: subsection.content,
    };

    if (lowerTitle.startsWith("pre-reading")) {
      preReading.push(subsectionEntry);
      continue;
    }

    if (
      lowerTitle.includes("reference answers") ||
      lowerTitle.includes("think aloud") ||
      lowerTitle.includes("reading skills") ||
      lowerTitle.includes("summary")
    ) {
      support.push(subsectionEntry);
      continue;
    }

    passage.push(subsectionEntry);
  }

  return {
    id: slugify(title),
    title,
    content,
    intro,
    preReading,
    passage,
    questions,
    support,
  };
}

function extractTitle(content: string, fallback: string) {
  const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading || fallback;
}

function extractDescription(content: string) {
  const lines = normalizeWhitespace(content)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#") && !line.startsWith("-") && !/^\d+\./.test(line));

  return lines[0] || "Reading lesson";
}

function countWords(content: string) {
  const words = normalizeWhitespace(content).match(/\b[\w'-]+\b/g);
  return words?.length ?? 0;
}

function countQuestions(content: string) {
  return (content.match(/^#{1,6}\s+Question\b/gm) || []).length;
}

function isPrimarySectionHeading(title: string) {
  return /^overview$/i.test(title) || /^part\s+\d+/i.test(title) || /^summary$/i.test(title);
}

function splitSections(content: string) {
  const normalized = normalizeWhitespace(content);
  const lines = normalized.split("\n");
  const primaryHeadings = Array.from(normalized.matchAll(/^##\s+(.+)$/gm)).map((match) => match[1].trim());

  if (primaryHeadings.length === 0 || !primaryHeadings.some((title) => isPrimarySectionHeading(title))) {
    return [buildSection(extractTitle(content, "Exam Paper"), content)];
  }

  const sections: LessonSection[] = [];
  let currentTitle = "Overview";
  let currentLines: string[] = [];

  const flush = () => {
    const sectionContent = currentLines.join("\n").trim();

    if (!sectionContent) {
      currentLines = [];
      return;
    }

    sections.push(buildSection(currentTitle, sectionContent));

    currentLines = [];
  };

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);

    if (match && isPrimarySectionHeading(match[1].trim())) {
      flush();
      currentTitle = match[1].trim();
      currentLines.push(`# ${currentTitle}`);
      continue;
    }

    currentLines.push(line);
  }

  flush();
  return sections;
}

async function readLessonFile(fileName: string) {
  const fullPath = path.join(MATERIAL_DIR, fileName);
  return fs.readFile(fullPath, "utf8");
}

async function getLessonFiles() {
  const entries = await fs.readdir(MATERIAL_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

export async function getLessons(): Promise<LessonSummary[]> {
  const files = await getLessonFiles();

  return Promise.all(
    files.map(async (fileName) => {
      const content = await readLessonFile(fileName);
      const fallbackTitle = fileName.replace(/\.md$/, "").replace(/-/g, " ");
      const sections = splitSections(content);
      const wordCount = countWords(content);
      const questionCount = countQuestions(content);

      return {
        slug: fileName.replace(/\.md$/, ""),
        title: extractTitle(content, fallbackTitle),
        description: extractDescription(content),
        sectionTitles: sections.map((section) => section.title),
        questionCount,
        wordCount,
        sectionCount: sections.length,
        paperType: derivePaperType(extractTitle(content, fallbackTitle), sections),
        studyFocuses: deriveStudyFocuses(content, sections),
        estimatedMinutes: estimateMinutes(wordCount, questionCount, sections.length),
      };
    }),
  );
}

export async function getLessonBySlug(slug: string): Promise<LessonDetail | null> {
  const fileName = `${slug}.md`;

  try {
    const content = await readLessonFile(fileName);
    const fallbackTitle = slug.replace(/-/g, " ");
    const sections = splitSections(content);
    const title = extractTitle(content, fallbackTitle);
    const wordCount = countWords(content);
    const questionCount = countQuestions(content);

    return {
      slug,
      title,
      description: extractDescription(content),
      sectionTitles: sections.map((section) => section.title),
      questionCount,
      wordCount,
      sectionCount: sections.length,
      paperType: derivePaperType(title, sections),
      studyFocuses: deriveStudyFocuses(content, sections),
      estimatedMinutes: estimateMinutes(wordCount, questionCount, sections.length),
      content,
      sections,
      studySteps: buildStudySteps(sections),
    };
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}