"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) router.replace("/admin/login");
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink">
        <p className="font-mono text-sm text-concrete">Checking session…</p>
      </div>
    );
  }

  return children;
}
