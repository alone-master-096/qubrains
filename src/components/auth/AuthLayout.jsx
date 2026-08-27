import { motion } from "framer-motion";

// A small, deliberate network of nodes — echoes "QuBrains" (connected minds)
// without leaning on the old quantum/particle visuals.
const NODES = [
  { cx: 60, cy: 70, r: 4 },
  { cx: 165, cy: 35, r: 5 },
  { cx: 235, cy: 110, r: 3 },
  { cx: 120, cy: 165, r: 6 },
  { cx: 265, cy: 210, r: 4 },
  { cx: 45, cy: 225, r: 3 },
  { cx: 195, cy: 285, r: 5 },
];

const LINKS = [
  [0, 1],
  [1, 2],
  [1, 3],
  [3, 0],
  [3, 4],
  [3, 5],
  [4, 6],
];

function NetworkMark({ className }) {
  return (
    <svg viewBox="0 0 300 320" className={className} fill="none" aria-hidden="true">
      {LINKS.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a].cx}
          y1={NODES[a].cy}
          x2={NODES[b].cx}
          y2={NODES[b].cy}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />
      ))}
      {NODES.map((n, i) => (
        <circle
          key={i}
          cx={n.cx}
          cy={n.cy}
          r={n.r}
          fill="currentColor"
          className={i % 3 === 0 ? "animate-pulse" : ""}
        />
      ))}
    </svg>
  );
}

function Mark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-signal font-display text-lg font-semibold text-ink">
      Q
    </span>
  );
}

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="grid min-h-screen bg-paper text-ink lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink text-paper lg:flex lg:flex-col lg:justify-between lg:p-12">
        <NetworkMark className="pointer-events-none absolute -right-12 -top-8 h-[420px] w-[420px] text-signal" />
        <div className="relative z-10 flex items-center gap-2">
          <Mark />
          <span className="font-display text-xl font-semibold tracking-tight">QuBrains</span>
        </div>
        <div className="relative z-10 max-w-sm">
          <p className="font-display text-3xl font-medium leading-tight">
            Conversations that stay close, wherever you are.
          </p>
          <p className="mt-4 text-sm text-paper/60">
            Real-time messaging and presence — built for the people you actually talk to.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Mark />
            <span className="font-display text-xl font-semibold tracking-tight">QuBrains</span>
          </div>

          {eyebrow && (
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-signal">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>}

          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
