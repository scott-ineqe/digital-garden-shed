// WCAG contrast ratio utilities

export function normalizeHex(hex: string): string | null {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return "#" + h.toLowerCase();
}

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const n = normalizeHex(hex)!;
  const r = parseInt(n.slice(1, 3), 16);
  const g = parseInt(n.slice(3, 5), 16);
  const b = parseInt(n.slice(5, 7), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export type WcagRating = "AAA" | "AA" | "AA Large" | "Fail";

export function rateContrast(ratio: number): WcagRating {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}

export function ratingColor(rating: WcagRating): string {
  switch (rating) {
    case "AAA":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "AA":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    case "AA Large":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "Fail":
      return "bg-red-500/20 text-red-300 border-red-500/30";
  }
}
