import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

type MarkdownRendererProps = {
  content: string;
  highlightTerms?: string[];
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function injectHighlights(content: string, highlightTerms: string[]) {
  const terms = Array.from(
    new Set(
      highlightTerms
        .map((term) => term.trim())
        .filter((term) => term.length >= 3),
    ),
  ).sort((left, right) => right.length - left.length);

  if (terms.length === 0) {
    return content;
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  return content.replace(pattern, '<mark class="passage-highlight">$1</mark>');
}

export function MarkdownRenderer({ content, highlightTerms = [] }: MarkdownRendererProps) {
  const renderedContent = useMemo(
    () => injectHighlights(content, highlightTerms),
    [content, highlightTerms],
  );

  return (
    <div className="lesson-prose">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ ...props }) => (
            <a
              {...props}
              className="font-semibold text-(--accent-deep) underline decoration-(--accent-soft) underline-offset-4"
            />
          ),
          h1: ({ ...props }) => <h1 {...props} className="text-3xl font-semibold tracking-tight" />,
          h2: ({ ...props }) => <h2 {...props} className="text-2xl font-semibold tracking-tight" />,
          h3: ({ ...props }) => <h3 {...props} className="text-xl font-semibold" />,
          p: ({ ...props }) => <p {...props} className="text-[1.02rem] leading-8" />,
          ul: ({ ...props }) => <ul {...props} className="list-disc" />,
          ol: ({ ...props }) => <ol {...props} className="list-decimal" />,
        }}
      >
        {renderedContent}
      </ReactMarkdown>
    </div>
  );
}