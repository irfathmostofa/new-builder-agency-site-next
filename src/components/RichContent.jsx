import { looksLikeHtml } from "../lib/content";

export default function RichContent({ html, className = "" }) {
  const value = html ?? "";
  if (!value) return null;
  if (looksLikeHtml(value)) {
    return (
      <div
        className={`rte-article ${className}`.trim()}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }
  return (
    <div className={`whitespace-pre-wrap ${className}`.trim()}>{value}</div>
  );
}
