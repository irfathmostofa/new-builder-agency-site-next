"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RichContent from "../components/RichContent";
import { getPost, peekPost } from "../lib/queries";

export default function BlogPost() {
  const { slug } = useParams();
  const cached = slug ? peekPost(slug) : null;
  const [post, setPost] = useState(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const existing = peekPost(slug);
    setNotFound(false);
    if (existing) {
      setPost(existing);
      setLoading(false);
    } else {
      setLoading(true);
    }

    getPost(slug).then((data) => {
      if (cancelled) return;
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPost(data);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading && !post) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="font-mono text-sm text-ink/50">Loading…</p>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-mono text-sm text-ink/50">We couldn't find that post.</p>
        <Link href="/blog" className="font-mono text-xs uppercase tracking-widest text-steel">
          ← Back to journal
        </Link>
      </div>
    );
  }

  return (
    <article className="px-6 pb-28 pt-36 md:px-12">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">
          {post.published_at
            ? new Date(post.published_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
          {post.title}
        </h1>

        {post.cover_image && (
          <img
            src={post.cover_image}
            alt=""
            className="mt-10 aspect-[16/9] w-full object-cover"
          />
        )}

        <RichContent
          html={post.content}
          className="mt-10 font-body text-lg leading-relaxed text-ink/80"
        />
      </div>
    </article>
  );
}
