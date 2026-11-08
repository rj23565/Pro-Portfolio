/**
 * Small monospace eyebrow label.
 *
 * Accessibility note: the accent colour (#C9A96A) only reaches ~2.2:1 against
 * white, so it is used for the border/dot only. The text stays ink (#1A1540),
 * which keeps every badge above WCAG AA regardless of the accent chosen in admin.
 */
export function Badge({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1 font-mono text-[11px] tracking-widest text-ink/70"
      style={accent ? { borderColor: `${accent}66` } : undefined}
    >
      {accent ? (
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}
