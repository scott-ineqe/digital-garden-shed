import { useState } from "react";
import { Eye } from "lucide-react";
import { normalizeHex, contrastRatio, rateContrast, ratingColor } from "@/lib/contrast";
import { ContrastBadges } from "@/components/ContrastBadges";

export function ContrastChecker() {
  const [input, setInput] = useState("#3B82F6");
  const normalized = normalizeHex(input);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Check a custom color</h2>
      </div>

      <div className="flex gap-3 items-center mb-5">
        <input
          type="color"
          value={normalized ?? "#000000"}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Pick a color to check"
          className="w-12 h-12 rounded-full cursor-pointer border-0 p-0 flex-shrink-0"
          style={{ background: "none" }}
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="#3B82F6"
          aria-label="Hex code"
          className="flex-1 glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring font-mono"
        />
      </div>

      {normalized ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <PreviewSwatch color={normalized} bg="#ffffff" label="On white" />
            <PreviewSwatch color={normalized} bg="#000000" label="On black" />
          </div>
          <ContrastBadges hex={normalized} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Enter a valid hex code (e.g. #3B82F6).</p>
      )}
    </div>
  );
}

function PreviewSwatch({ color, bg, label }: { color: string; bg: string; label: string }) {
  const ratio = contrastRatio(color, bg);
  const rating = rateContrast(ratio);
  return (
    <div
      className="rounded-xl p-4 border border-white/10"
      style={{ backgroundColor: bg, color }}
    >
      <p className="text-xs opacity-70 mb-1" style={{ color: bg === "#ffffff" ? "#666" : "#aaa" }}>
        {label}
      </p>
      <p className="text-lg font-semibold">Aa</p>
      <p className="text-xs font-mono mt-1" style={{ color: bg === "#ffffff" ? "#666" : "#aaa" }}>
        {ratio.toFixed(2)}:1 · <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] ${ratingColor(rating)}`}>{rating}</span>
      </p>
    </div>
  );
}
