"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth";

const ADMIN_EMAIL = "irfath@meridianbuilders.com";

export default function AdminLogin() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // "irfath" maps to the Supabase Auth account's email under the hood.
    const email = username.trim().toLowerCase() === "irfath" ? ADMIN_EMAIL : username;

    const { error } = await login(email, password);
    setSubmitting(false);

    if (error) {
      setError("Invalid username or password.");
      return;
    }

    const redirectTo = "/admin";
    router.replace(redirectTo);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">
          Admin
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-paper">
          Sign in
        </h1>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-concrete/70">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="mt-2 w-full border border-concrete/20 bg-transparent px-4 py-3 font-body text-paper outline-none focus:border-steel"
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-concrete/70">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full border border-concrete/20 bg-transparent px-4 py-3 font-body text-paper outline-none focus:border-steel"
            />
          </div>

          {error && <p className="font-mono text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber px-6 py-3 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:bg-paper disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
