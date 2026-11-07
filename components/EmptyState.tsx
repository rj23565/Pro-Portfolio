export default function EmptyState({ title, description, hint }: { title: string; description: string; hint?: string }) {
  return (
    <div className="rounded-[28px] border border-dashed border-ink/15 bg-white/60 p-10 md:p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-ivory-soft grid place-items-center text-ink/50">✦</div>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink/70">{description}</p>
      {hint && <p className="mx-auto mt-3 max-w-lg text-xs leading-5 text-ink/50 bg-ivory-soft rounded-full inline-block px-4 py-1">{hint}</p>}
    </div>
  );
}
