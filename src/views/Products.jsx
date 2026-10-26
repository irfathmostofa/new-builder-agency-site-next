"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PrefetchLink from "../components/PrefetchLink";
import { getProductCategories, getProducts, peekProductCategories, peekProducts, prefetchProduct } from "../lib/queries";

export default function Products() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");
  function setCategory(slug) {
    router.push(slug ? `/products?category=${slug}` : "/products");
  }
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = peekProductCategories();
    if (cached) setCategories(cached);
    getProductCategories().then((data) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cached = peekProducts(categorySlug);
    if (cached !== undefined) {
      setProducts(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    async function fetchProducts() {
      const data = await getProducts(categorySlug);
      if (!cancelled) {
        setProducts(data ?? []);
        setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  return (
    <div className="px-6 pb-28 pt-36 md:px-12">
      <div className="mx-auto max-w-[90rem]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">
          Products
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
          What we build with
        </h1>

        <div className="mt-8 flex flex-wrap gap-3 font-mono text-xs uppercase tracking-widest">
          <FilterPill
            active={!categorySlug}
            onClick={() => setCategory(null)}
            label="All"
          />
          {categories.map((c) => (
            <FilterPill
              key={c.id}
              active={categorySlug === c.slug}
              onClick={() => setCategory(c.slug)}
              label={c.name}
            />
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading && (
            <p className="col-span-full font-mono text-sm text-ink/50">
              Loading…
            </p>
          )}
          {!loading && products.length === 0 && (
            <p className="col-span-full font-mono text-sm text-ink/50">
              No products found.
            </p>
          )}
          {products.map((p) => (
            <PrefetchLink
              key={p.id}
              href={`/products/${p.slug}`}
              onPrefetch={() => prefetchProduct(p.slug)}
              className="group block"
            >
              <div className="aspect-square overflow-hidden bg-concrete">
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-steel">
                {p.product_categories?.name}
              </p>
              <h3 className="font-display text-lg font-semibold text-ink">
                {p.name}
              </h3>
              {p.price_label && (
                <p className="font-mono text-xs text-ink/50">{p.price_label}</p>
              )}
            </PrefetchLink>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterPill({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`border px-4 py-2 transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/20 text-ink/60 hover:border-ink/60 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
