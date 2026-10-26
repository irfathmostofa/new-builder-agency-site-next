"use client";

import Link from "next/link";

export default function PrefetchLink({ href, onPrefetch, children, ...props }) {
  function prefetch() {
    if (typeof onPrefetch === "function") onPrefetch();
  }

  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
      {...props}
    >
      {children}
    </Link>
  );
}
