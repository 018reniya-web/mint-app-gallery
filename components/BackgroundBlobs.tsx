/** 画面背景のふんわり動くアクセント（ギャラリー / ログイン画面で共通） */
export default function BackgroundBlobs({ secret = false }: { secret?: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {secret ? (
        <>
          <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-slate-700/40 blur-3xl animate-blob-drift" />
          <div
            className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-indigo-900/40 blur-3xl animate-blob-drift"
            style={{ animationDelay: "-6s" }}
          />
        </>
      ) : (
        <>
          <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-mint-300/30 blur-3xl animate-blob-drift" />
          <div
            className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl animate-blob-drift"
            style={{ animationDelay: "-6s" }}
          />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-mint-200/40 blur-3xl animate-blob-drift" />
        </>
      )}
    </div>
  );
}
