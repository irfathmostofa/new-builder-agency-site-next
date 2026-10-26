"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RichContent from "../components/RichContent";
import { getProduct, peekProduct } from "../lib/queries";

export default function ProductDetail() {
  const { slug } = useParams();
  const cached = slug ? peekProduct(slug) : null;
  const [product, setProduct] = useState(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const existing = peekProduct(slug);
    setNotFound(false);
    if (existing) {
      setProduct(existing);
      setLoading(false);
    } else {
      setLoading(true);
    }

    getProduct(slug).then((data) => {
      if (cancelled) return;
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProduct(data);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading && !product) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="font-mono text-sm text-ink/50">Loading…</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-mono text-sm text-ink/50">We couldn't find that product.</p>
        <Link href="/products" className="font-mono text-xs uppercase tracking-widest text-steel">
          ← Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 pb-28 pt-36 md:px-12">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-2">
        <div className="aspect-square bg-concrete">
          {product.image && (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">
            {product.product_categories?.name}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
            {product.name}
          </h1>
          {product.price_label && (
            <p className="mt-3 font-mono text-sm text-ink/70">{product.price_label}</p>
          )}
          <RichContent
            html={product.description}
            className="mt-6 font-body leading-relaxed text-ink/80"
          />
          <Link
            href="/contact"
            className="mt-8 inline-block bg-ink px-8 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel"
          >
            Enquire about this
          </Link>
        </div>
      </div>
    </div>
  );
}
