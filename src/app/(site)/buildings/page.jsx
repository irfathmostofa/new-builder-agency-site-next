import { Suspense } from "react";
import Buildings from "../../../views/Buildings";
import { buildMetadata } from "../../../lib/metadata";

export async function generateMetadata() {
  return buildMetadata("/buildings");
}

export default function Page() {
  return (
    <Suspense fallback={<p className="px-6 pt-36 font-mono text-sm text-ink/50">Loading…</p>}>
      <Buildings />
    </Suspense>
  );
}
