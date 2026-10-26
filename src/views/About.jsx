"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const process = [
  {
    title: "Site & concept",
    description:
      "We walk the site before we draw anything. Concept sketches come out of that visit, not a template.",
  },
  {
    title: "Design & permitting",
    description:
      "Structural drawings, engineering sign-off, and permit filings — handled in-house, not farmed out.",
  },
  {
    title: "Construction",
    description:
      "Our own crews and vetted subcontractors build to the drawing. The project manager who scoped it stays on through framing and finish.",
  },
  {
    title: "Handover & support",
    description:
      "Documentation, warranties, and a maintenance line that stays open after the keys change hands.",
  },
];

const principles = [
  {
    title: "One team, start to finish",
    description:
      "No handoff between departments that never talk to each other. The people who draft the plans are still on the job when it's built.",
  },
  {
    title: "The drawing is the contract",
    description:
      "What's signed off on paper is what gets poured, framed, and finished — not a rough approximation of it.",
  },
  {
    title: "Built for the second call",
    description:
      "Most of our clients come back for a second or third property. That only happens if the first one held up.",
  },
];

export default function About() {
  return (
    <div className="px-6 pb-28 pt-36 md:px-12">
      <div className="mx-auto max-w-[90rem]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">
          About
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
          Built on precision, not shortcuts.
        </h1>
        <p className="mt-8 font-body text-lg leading-relaxed text-ink/80">
          Meridian Builders has spent two decades turning blueprints into places
          people live, work, and gather. Every project on this site started the
          same way every project starts: a set of lines on paper, a site visit,
          and a client who wanted something specific done right.
        </p>
        <p className="mt-6 font-body text-lg leading-relaxed text-ink/80">
          We work across residential, commercial, and cottage-scale builds,
          managing everything from permitting to the final walkthrough. We don't
          sub the whole job out and check in at the end — the same team that
          draws the plans is the one that answers the phone once you've moved
          in.
        </p>

        <div className="mt-16 grid grid-cols-2 gap-8 border-t border-ink/10 pt-10 font-mono text-sm uppercase tracking-widest md:grid-cols-4">
          <Stat value="20+" label="Years" />
          <Stat value="140" label="Projects" />
          <Stat value="35" label="Team" />
          <Stat value="12" label="Cities" />
        </div>

        {/* How we work — a real sequence, so numbering earns its place */}
        <section className="mt-24">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">
            How we work
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-ink md:text-3xl">
            One process, no handoffs.
          </h2>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mt-10 space-y-8 border-t border-ink/10 pt-10"
          >
            {process.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="flex gap-6"
              >
                <span className="font-mono text-sm text-amber">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-1 font-body text-base leading-relaxed text-ink/60">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Principles — not a sequence, so no numbering here */}
        <section className="mt-24">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">
            What we hold to
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-ink md:text-3xl">
            The things we don't compromise on.
          </h2>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mt-10 grid grid-cols-1 gap-8 border-t border-ink/10 pt-10 sm:grid-cols-3"
          >
            {principles.map((p) => (
              <motion.div
                key={p.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
              >
                <h3 className="font-display text-base font-semibold text-ink">
                  {p.title}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-ink/60">
                  {p.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Closing statement — same amber-rule quote device as the home page */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mt-24 border-l-2 border-amber pl-6"
        >
          <p className="font-display text-xl italic leading-snug text-ink">
            "We're slower to scale than most builders our size. That's on
            purpose — it's the only way a drawing signed off in year one still
            matches the building standing in year twenty."
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-24 flex flex-col items-start gap-4 border-t border-ink/10 pt-10 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="font-display text-xl font-semibold text-ink">
            Have a site in mind?
          </p>
          <Link
            href="/contact"
            className="inline-block bg-ink px-8 py-3 font-mono text-xs uppercase tracking-widest text-paper transition-colors hover:bg-amber hover:text-ink"
          >
            Start a conversation
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="font-display text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-ink/50">{label}</p>
    </div>
  );
}
