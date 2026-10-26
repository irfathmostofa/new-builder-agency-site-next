"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RichContent from "../components/RichContent";
import { getService, peekService } from "../lib/queries";

const SERVICE_DEMO_IMAGE = "/service-demo.svg";

export default function ServiceDetail() {
  const { slug } = useParams();
  const cached = slug ? peekService(slug) : null;
  const [service, setService] = useState(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const existing = peekService(slug);
    setNotFound(false);
    if (existing) {
      setService(existing);
      setLoading(false);
    } else {
      setLoading(true);
    }

    getService(slug).then((data) => {
      if (cancelled) return;
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setService(data);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading && !service) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="font-mono text-sm text-ink/50">Loading…</p>
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-mono text-sm text-ink/50">We couldn't find that service.</p>
        <Link href="/what-we-do" className="font-mono text-xs uppercase tracking-widest text-steel">
          ← Back to services
        </Link>
      </div>
    );
  }

  return (
    <article className="px-6 pb-28 pt-36 md:px-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/what-we-do"
          className="font-mono text-xs uppercase tracking-widest text-steel hover:text-ink"
        >
          ← What we do
        </Link>
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-steel">
          Service
        </p>
        {service.icon && <p className="mt-3 text-4xl">{service.icon}</p>}
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
          {service.title}
        </h1>

        <div className="mt-10 aspect-[16/9] overflow-hidden bg-concrete">
          <img
            src={service.image_url || SERVICE_DEMO_IMAGE}
            alt={service.title}
            className="h-full w-full object-cover"
          />
        </div>

        {service.description && (
          <RichContent
            html={service.description}
            className="mt-10 font-body text-lg leading-relaxed text-ink/80"
          />
        )}

        <Link
          href="/contact"
          className="mt-12 inline-block bg-ink px-8 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel"
        >
          Enquire about this
        </Link>
      </div>
    </article>
  );
}
