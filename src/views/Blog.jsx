"use client";

import { useEffect, useState } from "react";
import PrefetchLink from "../components/PrefetchLink";
import { getPosts, peekPosts, prefetchPost } from "../lib/queries";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = peekPosts();
    if (cached !== undefined) {
      setPosts(cached);
      setLoading(false);
    }
    getPosts().then((data) => {
      setPosts(data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="px-6 pb-28 pt-36 md:px-12">
      <div className="mx-auto max-w-[90rem]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">
          Journal
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
          Notes from the field
        </h1>

        <div className="mt-14 divide-y divide-ink/10 border-t border-ink/10">
          {loading && (
            <p className="py-8 font-mono text-sm text-ink/50">Loading…</p>
          )}
          {!loading && posts.length === 0 && (
            <p className="py-8 font-mono text-sm text-ink/50">
              No posts published yet.
            </p>
          )}
          {posts.map((post) => (
            <PrefetchLink
              key={post.id}
              href={`/blog/${post.slug}`}
              onPrefetch={() => prefetchPost(post.slug)}
              className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-[200px_1fr]"
            >
              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                />
              )}
              <div>
                <p className="font-mono text-xs text-ink/40">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : ""}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                  {post.title}
                </h2>
                <p className="mt-2 font-body text-ink/70">{post.excerpt}</p>
              </div>
            </PrefetchLink>
          ))}
        </div>
      </div>
    </div>
  );
}
