import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Read-only markdown renderer (GFM tables) for skills without a bespoke view. */
export function MarkdownArtifact({ markdown }: { markdown: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_table]:w-full [&_table]:text-left [&_td]:border-b [&_td]:border-border/50 [&_td]:py-1 [&_td]:pr-3 [&_th]:border-b [&_th]:border-border [&_th]:py-1 [&_th]:pr-3 [&_ul]:list-disc [&_ul]:pl-5">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
