import { tv } from "./ui/styles";
import ReactMarkdown from "react-markdown";

const markdown = tv({
  slots: {
    root: "min-w-0 text-meta leading-[1.7] wrap-anywhere [&>:first-child]:mt-0 [&>:last-child]:mb-0",
    heading: "mt-4 mb-2 leading-snug font-bold text-text tracking-normal",
    paragraph: "mb-3",
    list: "my-2 pl-6",
    item: "[&+&]:mt-1 [&>p]:mb-1",
    pre: "my-2 overflow-x-auto rounded-control bg-surface-2 p-3",
    code: "rounded-md bg-surface-2 px-1 py-px text-[.9em] [pre_&]:whitespace-pre [pre_&]:bg-transparent [pre_&]:p-0 [pre_&]:[overflow-wrap:normal]",
    quote: "my-2 border-l-3 border-border pl-3 text-text-2",
    link: "relative z-10 text-accent underline",
  },
  variants: { compact: { true: {
    root: "text-meta leading-[1.65]",
    heading: "m-0 text-[1em] leading-[inherit]",
    paragraph: "m-0",
    list: "my-0",
    item: "[&+&]:mt-0",
    pre: "m-0 p-0",
    quote: "my-0",
  } } },
});

/** Raw HTML is discarded; keep react-markdown's default safe URL transform. */
export function Markdown({ children, className, compact = false }: { children: string; className?: string; compact?: boolean }) {
  const styles = markdown({ compact });
  return (
    <div data-slot="markdown" className={styles.root({ className })}>
      <ReactMarkdown skipHtml components={{
        h1: ({ children }) => <h1 className={styles.heading({ className: compact ? "text-[1em]" : "text-[1.3em]" })}>{children}</h1>,
        h2: ({ children }) => <h2 className={styles.heading({ className: compact ? "text-[1em]" : "text-[1.15em]" })}>{children}</h2>,
        h3: ({ children }) => <h3 className={styles.heading({ className: "text-[1em]" })}>{children}</h3>,
        h4: ({ children }) => <h4 className={styles.heading({ className: "text-[1em]" })}>{children}</h4>,
        h5: ({ children }) => <h5 className={styles.heading({ className: "text-[1em]" })}>{children}</h5>,
        h6: ({ children }) => <h6 className={styles.heading({ className: "text-[1em]" })}>{children}</h6>,
        p: ({ children }) => <p className={styles.paragraph()}>{children}</p>,
        ul: ({ children }) => <ul className={styles.list({ className: "list-disc" })}>{children}</ul>,
        ol: ({ children, start }) => <ol start={start} className={styles.list({ className: "list-decimal" })}>{children}</ol>,
        li: ({ children }) => <li className={styles.item()}>{children}</li>,
        pre: ({ children }) => <pre className={styles.pre()}>{children}</pre>,
        code: ({ children, className }) => <code className={styles.code({ className })}>{children}</code>,
        blockquote: ({ children }) => <blockquote className={styles.quote()}>{children}</blockquote>,
        a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className={styles.link()}>{children}</a>,
        img: ({ src, alt, title }) => <img src={src} alt={alt} title={title} className="h-auto max-w-full" />,
        hr: () => <hr className="my-4 border-border" />,
      }}>{children}</ReactMarkdown>
    </div>
  );
}
