"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, LogIn, Sparkles, User } from "lucide-react";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <BackgroundBlobs />
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [logoOk, setLogoOk] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await signIn(id, password);
      // サイト内のパスのみ許可（外部 URL へのリダイレクトを防ぐ）
      const next = searchParams.get("next");
      const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      router.replace(dest);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("ID またはパスワードが違います。");
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/60 bg-white/85 p-6 shadow-card backdrop-blur sm:p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        {logoOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/MINTlognew.png"
            alt="MINT"
            className="h-12 w-auto max-w-[200px] object-contain"
            onError={() => setLogoOk(false)}
          />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-500 text-white shadow-card">
            <Sparkles className="h-6 w-6" />
          </span>
        )}
        <div>
          <h1 className="text-xl font-bold text-slateink">MINT App Gallery</h1>
          <p className="mt-1 text-sm text-slateink-soft">
            ID とパスワードでログインしてください
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slateink">ID</span>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              required
              autoFocus
              autoComplete="username"
              autoCapitalize="none"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className={inputClass + " pl-9"}
              placeholder="yamada"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slateink">パスワード</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              required
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass + " pl-9 pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slateink"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-mint-500 px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-mint-600 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:ring-offset-2 disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          ログイン
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">
        アカウントが必要な場合は管理者にお問い合わせください
      </p>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slateink outline-none transition focus:border-mint-400 focus:ring-2 focus:ring-mint-100";
