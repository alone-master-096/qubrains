export default function Avatar({ name, src, size = 40, online = false }) {
  const initial = name?.trim()?.[0]?.toUpperCase() || "?";
  const dimension = `${size}px`;

  return (
    <span className="relative inline-flex shrink-0" style={{ width: dimension, height: dimension }}>
      {src ? (
        <img src={src} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-full bg-ink font-display font-semibold text-paper"
          style={{ fontSize: size * 0.4 }}
        >
          {initial}
        </span>
      )}
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-paper bg-pulse" />
      )}
    </span>
  );
}
