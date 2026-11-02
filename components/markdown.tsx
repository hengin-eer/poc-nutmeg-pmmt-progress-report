import ReactMarkdown from "react-markdown";

/** Raw HTML is discarded; keep react-markdown's default safe URL transform. */
type MarkdownProps = { children: string; className?: string };

export function Markdown({ children, className = "" }: MarkdownProps) {
  return (
    <div className={`markdown ${className}`}>
      <ReactMarkdown
        skipHtml
        components={{
          a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer">{children}</a>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
