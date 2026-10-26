import Link from "next/link";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">404</p>
      <h1 className="font-display text-3xl font-semibold text-ink">Page not found</h1>
      <p className="font-body text-ink/70">That URL is not on the drawings.</p>
      <Link href="/" className="font-mono text-xs uppercase tracking-widest text-steel hover:text-ink">
        ← Back to home
      </Link>
    </div>
  );
}
