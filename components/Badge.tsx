export function Badge({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return <span className="inline-flex items-center rounded-full border border-ink/10 bg-white px-3 py-1 font-mono text-[11px] tracking-widest text-ink/70" style={accent? { borderColor: accent, color: accent }: undefined}>{children}</span>;
}
