import type { DictionaryEntry } from "./MarkdownText";
import MarkdownText from "./MarkdownText";

export type { DictionaryEntry };

interface Props {
  source: string;
  dictionary?: DictionaryEntry[];
  onHighlightDictionaryTerm?: (term: string | null) => void;
  className?: string;
}

/** Renders segment source as markdown. Pass dictionary + onHighlightDictionaryTerm to enable inline term highlighting (scroll/highlight in left sidebar). */
export default function SegmentWithDictionary({
  source,
  dictionary,
  onHighlightDictionaryTerm,
  className = "",
}: Props) {
  return (
    <MarkdownText
      className={className}
      dictionary={dictionary}
      onHighlightDictionaryTerm={onHighlightDictionaryTerm}
    >
      {source}
    </MarkdownText>
  );
}
