"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-terracotta";

export function AdminLoginForm({ nextParam }: { nextParam: Promise<string | undefined> }) {
  const next = use(nextParam) ?? "/admin";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={login} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          className={inputCls}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Password</span>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            required
            autoComplete="current-password"
            className={inputCls + " pr-10"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            tabIndex={-1}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </label>

      {error && (
        <p className="rounded-xl bg-chili/10 px-3 py-2 text-sm text-chili">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Spinner size={16} /> : null}
        Sign in
      </button>

      {/* <p className="text-center text-xs text-muted">
        First time? Create your admin account in the Supabase dashboard under{" "}
        <span className="font-medium">Authentication → Users → Invite user</span>.
      </p> */}
    </form>
  );
}
