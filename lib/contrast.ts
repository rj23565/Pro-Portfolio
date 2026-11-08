/**
 * Contrast utilities for the editable accent colour.
 *
 * The accent is user-editable in the admin, so we cannot assume white text on
 * it is readable. The default gold (#C9A96A) is only 2.24:1 against white —
 * far below WCAG AA (4.5:1) — so we pick ink text instead of hard-coding white.
 */

const INK = "#1A1540";
const WHITE = "#FFFFFF";

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const h = normalizeHex(hex).slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

export function normalizeHex(input: string): string {
  const t = (input || "").trim();
  if (/^#([0-9a-f]{6})$/i.test(t)) return t.toUpperCase();
  if (/^#([0-9a-f]{3})$/i.test(t)) {
    const [, s] = t.match(/^#([0-9a-f]{3})$/i)!;
    return ("#" + s.split("").map((c) => c + c).join("")).toUpperCase();
  }
  return "#C9A96A";
}

/**
 * Text colour to place on top of `background`, choosing whichever of ink/white
 * has the higher contrast. Keeps accent-filled buttons readable even if the
 * admin picks a pale gold or a light lavender.
 */
export function readableOn(background: string): string {
  const bg = normalizeHex(background);
  return contrastRatio(WHITE, bg) >= contrastRatio(INK, bg) ? WHITE : INK;
}

/** Style for a filled accent button/avatar: accent background, readable label. */
export function accentSurface(background: string): {
  background: string;
  color: string;
} {
  const bg = normalizeHex(background);
  return { background: bg, color: readableOn(bg) };
}
