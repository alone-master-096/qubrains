export default function Loader({ label = "Loading…", fullScreen = false }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        fullScreen
          ? "flex min-h-screen items-center justify-center bg-paper"
          : "flex items-center justify-center py-8"
      }
    >
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-signal" />
        <span className="text-sm text-zinc-500">{label}</span>
      </div>
    </div>
  );
}
