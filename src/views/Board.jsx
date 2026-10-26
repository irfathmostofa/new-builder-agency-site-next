"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getBoardMembers, peekBoardMembers } from "../lib/queries";

export default function Board() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = peekBoardMembers();
    if (cached !== undefined) {
      setMembers(cached);
      setLoading(false);
    }
    getBoardMembers().then((data) => {
      setMembers(data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="px-6 pb-28 pt-36 md:px-12">
      <div className="mx-auto max-w-4xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">
          Leadership
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
          Board of Directors
        </h1>

        <div className="mt-16 divide-y divide-ink/10 border-t border-ink/10">
          {loading && (
            <p className="py-8 font-mono text-sm text-ink/50">Loading…</p>
          )}
          {!loading && members.length === 0 && (
            <p className="py-8 font-mono text-sm text-ink/50">
              Board information coming soon.
            </p>
          )}
          {members.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
              className="grid grid-cols-1 gap-6 py-10 sm:grid-cols-[300px_1fr] sm:items-start"
            >
              <div className="aspect-square w-full max-w-[300px] overflow-hidden bg-concrete sm:max-w-none">
                {m.photo_url && (
                  <img
                    src={m.photo_url}
                    alt={m.name}
                    className="h-full w-full object-cover grayscale"
                  />
                )}
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold text-ink">
                  {m.name}
                </h3>
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-steel">
                  {m.role}
                </p>
                {m.bio && (
                  <p className="mt-3 max-w-2xl font-body leading-relaxed text-ink/70">
                    {m.bio}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
