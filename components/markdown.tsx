import ReactMarkdown from "react-markdown";

/** Raw HTML is discarded; keep react-markdown's default safe URL transform. */
export function Markdown({ children, className = "" }: { children: string; className?: string }) {
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
