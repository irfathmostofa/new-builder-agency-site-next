"use client";

import { useEffect, useState } from "react";

export function useCachedResource(peekFn, loader, deps = []) {
  const [data, setData] = useState(() => peekFn());
  const [loading, setLoading] = useState(() => peekFn() === undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const cached = peekFn();
    if (cached !== undefined) {
      setData(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    Promise.resolve()
      .then(loader)
      .then((value) => {
        if (cancelled) return;
        setData(value);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
