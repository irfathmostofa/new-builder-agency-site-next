"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, animate } from "framer-motion";
import HeroSlider from "../components/HeroSlider";
import BuildingCard from "../components/BuildingCard";
import { useBuildings } from "../hooks/useBuildings";
import PrefetchLink from "../components/PrefetchLink";
import { excerpt, servicePath, serviceSlug } from "../lib/content";
import {
  getSiteSettings,
  getGalleryImages,
  getFeaturedProducts,
  getServices,
  peekSiteSettings,
  peekGalleryImages,
  peekFeaturedProducts,
  peekServices,
  prefetchProduct,
  prefetchService,
} from "../lib/queries";

const SERVICE_DEMO_IMAGE = "/service-demo.svg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function parseStat(value) {
  const match = String(value ?? "").match(/^([^0-9]*)([0-9]+)(.*)$/);
  if (!match) return { prefix: "", number: null, suffix: value ?? "" };
  return { prefix: match[1], number: parseInt(match[2], 10), suffix: match[3] };
}

function StatNumber({ value }) {
  const { prefix, number, suffix } = parseStat(value);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || number == null) return;
    const controls = animate(0, number, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [inView, number]);

  return (
    <span ref={ref}>
      {prefix}
      {number == null ? suffix : display}
      {number != null ? suffix : ""}
    </span>
  );
}

export default function Home() {
  const { buildings: featured, loading } = useBuildings({ featuredOnly: true });
  const [settings, setSettings] = useState(null);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [productsPreview, setProductsPreview] = useState([]);
  const [servicesPreview, setServicesPreview] = useState([]);

  useEffect(() => {
    const cachedSettings = peekSiteSettings();
    const cachedGallery = peekGalleryImages();
    const cachedProducts = peekFeaturedProducts();
    const cachedServices = peekServices();
    if (cachedSettings) setSettings(cachedSettings);
    if (cachedGallery) setGalleryPreview(cachedGallery.slice(0, 10));
    if (cachedProducts) setProductsPreview(cachedProducts);
    if (cachedServices) setServicesPreview(cachedServices.slice(0, 6));
    getSiteSettings().then((data) => setSettings(data));
    getGalleryImages().then((data) => setGalleryPreview((data ?? []).slice(0, 10)));
    getFeaturedProducts().then((data) => setProductsPreview(data ?? []));
    getServices().then((data) => setServicesPreview((data ?? []).slice(0, 6)));
  }, []);

  const bento = featured.slice(0, 4);

  return (
    <div>
      <HeroSlider
        buildings={loading ? [] : featured}
        eyebrow={settings?.hero_eyebrow || "Est. from the ground up"}
      />

      {/* Intro statement */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="mx-auto max-w-4xl px-6 py-14 text-center md:px-12 md:py-16"
      >
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-steel"
        >
          Est. from ground up
        </motion.p>
        <motion.h2
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-4 font-display text-2xl font-medium leading-snug text-ink sm:text-3xl md:text-4xl"
        >
          {settings?.intro_heading ||
            "Every building starts as a line on paper. We're proud of every stage between that first line and the last coat of paint."}
        </motion.h2>
      </motion.section>

      {/* About us — diagonal-clipped image, editorial split */}
      <section className="px-6 py-14 md:px-12 md:py-16">
        <div className="mx-auto grid max-w-[90rem] grid-cols-1 gap-8 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="order-2 md:order-1 md:pr-10"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">
              {settings?.about_heading || "About us"}
            </p>
            <p className="mt-4 font-body text-lg leading-relaxed text-ink/80 md:text-xl">
              {settings?.about_body ||
                "Meridian Builders has spent two decades turning blueprints into places people live, work, and gather."}
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-steel hover:text-ink"
            >
              More about us <span aria-hidden>→</span>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="order-1 aspect-[5/4] overflow-hidden bg-concrete md:order-2"
            style={{ clipPath: "polygon(6% 0, 100% 0, 100% 100%, 0 100%)" }}
          >
            {settings?.about_image && (
              <motion.img
                src={settings.about_image}
                alt=""
                initial={{ scale: 1.15 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                className="h-full w-full object-cover"
              />
            )}
          </motion.div>
        </div>
      </section>

      {/* What we do */}
      <section className="bg-concrete/40 px-6 py-14 md:px-12 md:py-16">
        <div className="mx-auto max-w-[90rem]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-end justify-between"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">
                Services
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink sm:text-2xl">
                What we do
              </h3>
            </div>
            <Link
              href="/what-we-do"
              className="font-mono text-xs uppercase tracking-widest text-steel hover:text-ink"
            >
              View all →
            </Link>
          </motion.div>
          {servicesPreview.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {servicesPreview.map((s) => (
                <motion.div
                  key={s.id}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="overflow-hidden border border-ink/10 bg-paper"
                >
                  <PrefetchLink
                    href={servicePath(s)}
                    onPrefetch={() => prefetchService(serviceSlug(s))}
                    className="block"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-concrete">
                      <img
                        src={s.image_url || SERVICE_DEMO_IMAGE}
                        alt={s.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      {s.icon && <p className="text-3xl">{s.icon}</p>}
                      <h4 className="mt-3 font-display text-lg font-semibold text-ink">
                        {s.title}
                      </h4>
                      {s.description && (
                        <p className="mt-2 font-body text-sm leading-relaxed text-ink/70">
                          {excerpt(s.description)}
                        </p>
                      )}
                      <span className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-steel hover:text-ink">
                        View more <span aria-hidden>→</span>
                      </span>
                    </div>
                  </PrefetchLink>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="font-body text-ink/70">
              Every service a build needs, in-house — from planning through handover.
            </p>
          )}
        </div>
      </section>

      {/* Featured buildings — bento grid */}
      <section className="px-6 py-14 md:px-12 md:py-16">
        <div className="mx-auto max-w-[90rem]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-end justify-between"
          >
            <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">
              {settings?.featured_section_heading || "Featured work"}
            </h3>
            <Link
              href="/buildings"
              className="font-mono text-xs uppercase tracking-widest text-steel hover:text-ink"
            >
              View all →
            </Link>
          </motion.div>

          {bento.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[220px]">
              {bento.map((b, i) => (
                <div
                  key={b.id}
                  className={
                    i === 0
                      ? "sm:col-span-2 lg:col-span-2 lg:row-span-2"
                      : i === 1
                        ? "lg:col-span-2"
                        : ""
                  }
                >
                  <BuildingCard
                    building={b}
                    index={i}
                    className="h-full min-h-[280px] lg:min-h-0"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats — animated count-up */}
      {settings?.stats?.length > 0 && (
        <section className="border-y border-ink/10 px-6 py-12 md:px-12 md:py-14">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="mx-auto max-w-4xl"
          >
            <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-steel">
              Project record
            </p>
            <div className="grid grid-cols-2 divide-y divide-ink/10 border border-ink/10 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
              {settings.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="px-4 py-6 text-center"
                >
                  <p className="font-mono text-2xl font-semibold text-ink sm:text-3xl">
                    <StatNumber value={stat.value} />
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink/50">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Gallery preview — infinite marquee strip */}
      {galleryPreview.length > 0 && (
        <section className="overflow-hidden py-14 md:py-16">
          <div className="mx-auto mb-8 flex max-w-[90rem] items-end justify-between px-6 md:px-12">
            <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">
              {settings?.gallery_section_heading || "Gallery"}
            </h3>
            <Link
              href="/gallery"
              className="font-mono text-xs uppercase tracking-widest text-steel hover:text-ink"
            >
              View all →
            </Link>
          </div>
          <div className="group flex w-max gap-4 [&:hover>*]:[animation-play-state:paused]">
            <div className="flex animate-marquee gap-4">
              {[...galleryPreview, ...galleryPreview].map((img, i) => (
                <div
                  key={i}
                  className="h-56 w-72 flex-shrink-0 overflow-hidden bg-concrete sm:h-64 sm:w-80"
                >
                  <img
                    src={img.url}
                    alt={img.caption ?? ""}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products preview */}
      {productsPreview.length > 0 && (
        <section className="bg-concrete/40 px-6 py-14 md:px-12 md:py-16">
          <div className="mx-auto max-w-[90rem]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-8 flex items-end justify-between"
            >
              <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">
                {settings?.products_section_heading || "Products"}
              </h3>
              <Link
                href="/products"
                className="font-mono text-xs uppercase tracking-widest text-steel hover:text-ink"
              >
                View all →
              </Link>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="grid grid-cols-1 gap-6 sm:grid-cols-3"
            >
              {productsPreview.map((p) => (
                <motion.div
                  key={p.id}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                >
                  <PrefetchLink
                    href={`/products/${p.slug}`}
                    onPrefetch={() => prefetchProduct(p.slug)}
                    className="group block"
                  >
                    <div className="aspect-square overflow-hidden bg-paper">
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <h4 className="mt-3 font-display text-lg font-semibold text-ink">
                      {p.name}
                    </h4>
                  </PrefetchLink>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Clients */}
      {settings?.clients?.length > 0 && (
        <section className="border-t border-ink/10 px-6 py-12 md:px-12 md:py-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-[90rem] text-center font-mono text-xs uppercase tracking-widest text-ink/40"
          >
            Trusted by
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="mx-auto mt-8 flex max-w-[90rem] flex-wrap items-center justify-center gap-x-12 gap-y-6"
          >
            {settings.clients.map((client, i) => (
              <motion.img
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                src={client.logo_url}
                alt={client.name}
                title={client.name}
                className="h-8 w-auto grayscale opacity-60 transition-opacity hover:opacity-100 sm:h-10"
              />
            ))}
          </motion.div>
        </section>
      )}

      {/* Brochure download */}
      {settings?.brochure_url && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="px-6 py-10 text-center md:px-12 md:py-12"
        >
          <a
            href={settings.brochure_url}
            target="_blank"
            rel="noreferrer"
            download
            className="inline-flex items-center gap-3 border border-ink px-8 py-3 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            ↓ {settings.brochure_label || "Download brochure"}
          </a>
        </motion.section>
      )}

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-ink px-6 py-16 text-center md:px-12 md:py-20"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <svg className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <pattern
                id="cta-grid"
                width="56"
                height="56"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 56 0 L 0 0 0 56"
                  className="blueprint-line"
                  strokeOpacity="0.6"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>
        </div>
        <div className="relative">
          <h3 className="font-display text-2xl font-semibold text-paper sm:text-3xl md:text-4xl">
            {settings?.cta_heading || "Have a site in mind?"}
          </h3>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 inline-block"
          >
            <Link
              href="/contact"
              className="inline-block bg-amber px-8 py-3 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:bg-paper"
            >
              {settings?.cta_button_text || "Start a conversation"}
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
