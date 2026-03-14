import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface DictionaryEntry {
  term: string;
  definition: string;
}

interface Props {
  children: string;
  className?: string;
  /** When set, dictionary terms in text nodes are wrapped in inline spans that trigger highlight in sidebar (hover/click). */
  dictionary?: DictionaryEntry[];
  onHighlightDictionaryTerm?: (term: string | null) => void;
}

type TextPart =
  | { type: "text"; content: string }
  | { type: "term"; content: string; key: string };

function findTermMatches(
  source: string,
  dictionary: DictionaryEntry[]
): { start: number; end: number; display: string }[] {
  const sorted = [...dictionary].sort(
    (a, b) => b.term.length - a.term.length
  );
  const lower = source.toLowerCase();
  const matched: boolean[] = new Array(source.length).fill(false);
  const result: { start: number; end: number; display: string }[] = [];
  for (let i = 0; i < source.length; i++) {
    if (matched[i]) continue;
    for (const entry of sorted) {
      const len = entry.term.length;
      if (
        i + len <= source.length &&
        lower.slice(i, i + len) === entry.term.toLowerCase()
      ) {
        result.push({
          start: i,
          end: i + len,
          display: source.slice(i, i + len),
        });
        for (let j = i; j < i + len; j++) matched[j] = true;
        break;
      }
    }
  }
  result.sort((a, b) => a.start - b.start);
  return result;
}

function splitTextByTerms(
  source: string,
  dictionary: DictionaryEntry[]
): TextPart[] {
  const matches = findTermMatches(source, dictionary);
  const parts: TextPart[] = [];
  let last = 0;
  for (const m of matches) {
    if (m.start > last) {
      parts.push({ type: "text", content: source.slice(last, m.start) });
    }
    parts.push({
      type: "term",
      content: m.display,
      key: `${m.start}-${m.end}`,
    });
    last = m.end;
  }
  if (last < source.length) {
    parts.push({ type: "text", content: source.slice(last) });
  }
  if (parts.length === 0 && source.length > 0) {
    parts.push({ type: "text", content: source });
  }
  return parts;
}

/** Renders markdown as formatted content (presentation only). Use raw text when sending to APIs. */
export default function MarkdownText({
  children,
  className = "",
  dictionary,
  onHighlightDictionaryTerm,
}: Props) {
  const hasTermHighlight =
    dictionary?.length && onHighlightDictionaryTerm;

  const baseComponents = {
    p: ({ children: c }: { children: React.ReactNode }) => (
      <p className="mb-1 last:mb-0 text-inherit">{c}</p>
    ),
    strong: ({ children: c }: { children: React.ReactNode }) => (
      <strong className="font-semibold text-inherit">{c}</strong>
    ),
    em: ({ children: c }: { children: React.ReactNode }) => (
      <em className="italic text-inherit">{c}</em>
    ),
    h1: ({ children: c }: { children: React.ReactNode }) => (
      <h1 className="mb-1 mt-2 text-base font-bold first:mt-0">{c}</h1>
    ),
    h2: ({ children: c }: { children: React.ReactNode }) => (
      <h2 className="mb-1 mt-2 text-sm font-bold first:mt-0">{c}</h2>
    ),
    h3: ({ children: c }: { children: React.ReactNode }) => (
      <h3 className="mb-1 mt-1.5 text-sm font-semibold first:mt-0">{c}</h3>
    ),
    ul: ({ children: c }: { children: React.ReactNode }) => (
      <ul className="mb-1 list-disc pl-5 text-inherit">{c}</ul>
    ),
    ol: ({ children: c }: { children: React.ReactNode }) => (
      <ol className="mb-1 list-decimal pl-5 text-inherit">{c}</ol>
    ),
    li: ({ children: c }: { children: React.ReactNode }) => (
      <li className="my-0.5 text-inherit">{c}</li>
    ),
    code: ({ children: c }: { children: React.ReactNode }) => (
      <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs text-inherit">
        {c}
      </code>
    ),
  };

  const textComponent = hasTermHighlight
    ? ({ children: textContent }: { children: string }) => {
        if (typeof textContent !== "string") return <>{textContent}</>;
        const parts = splitTextByTerms(textContent, dictionary!);
        if (
          parts.length === 1 &&
          parts[0].type === "text"
        ) {
          return <>{textContent}</>;
        }
        return (
          <>
            {parts.map((part, i) =>
              part.type === "text" ? (
                part.content
              ) : (
                <span
                  key={part.key}
                  className="cursor-pointer border-b border-dashed border-slate-400 text-inherit hover:border-slate-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHighlightDictionaryTerm?.(part.content);
                  }}
                  onMouseEnter={() =>
                    onHighlightDictionaryTerm?.(part.content)
                  }
                  onMouseLeave={() => onHighlightDictionaryTerm?.(null)}
                >
                  {part.content}
                </span>
              )
            )}
          </>
        );
      }
    : undefined;

  const components = {
    ...baseComponents,
    ...(textComponent ? { text: textComponent } : {}),
  };

  return (
    <div
      className={`markdown-content ${className}`}
      data-testid="markdown-content"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
