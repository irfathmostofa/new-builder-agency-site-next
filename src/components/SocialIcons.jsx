// Minimal brand icon set (lucide-react no longer bundles social/brand icons).
// Each takes the same props as a lucide icon (size, className) for drop-in use.

function Base({ size = 18, className, children, viewBox = "0 0 24 24" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function FacebookIcon(props) {
  return (
    <Base {...props}>
      <path d="M13.5 21v-8.5h2.9l.4-3.4h-3.3V7c0-1 .3-1.6 1.7-1.6h1.7V2.3C16.6 2.2 15.5 2 14.3 2 11.8 2 10 3.5 10 6.3v2.8H7v3.4h3v8.5h3.5Z" />
    </Base>
  );
}

export function InstagramIcon(props) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" />
    </Base>
  );
}

export function LinkedinIcon(props) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="6.2" y="9.5" width="2.2" height="8" />
      <circle cx="7.3" cy="6.3" r="1.3" />
      <path d="M11.2 17.5v-5c0-1.8 1-3 2.6-3 1.5 0 2.4 1 2.4 3v5h-2.2v-4.5c0-.8-.3-1.3-1-1.3-.6 0-1 .4-1.1 1.1v4.7h-2.7Z" />
    </Base>
  );
}

export function TwitterIcon(props) {
  return (
    <Base {...props}>
      <path d="M4 4l7.2 9.6L4.4 20H6l6-6.5 4.4 6.5h4l-7.5-10L19.7 4h-1.6l-5.4 5.9L8.4 4H4Z" />
    </Base>
  );
}

export function YoutubeIcon(props) {
  return (
    <Base {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.2 9.2v5.6l4.8-2.8-4.8-2.8Z" />
    </Base>
  );
}
