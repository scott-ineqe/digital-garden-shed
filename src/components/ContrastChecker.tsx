import { useState } from "react";
import { Eye } from "lucide-react";
import { normalizeHex, contrastRatio, rateContrast, ratingColor } from "@/lib/contrast";

export function ContrastChecker() {
  const [fgInput, setFgInput] = useState("#3B82F6");
  const [bgInput, setBgInput] = useState("#FFFFFF");
  const fg = normalizeHex(fgInput);
  const bg = normalizeHex(bgInput);
  const valid = fg && bg;

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Check two colours</h2>
      </div>

      <div className="space-y-3 mb-5">
        <ColorInput
          label="Foreground"
          value={fgInput}
          onChange={setFgInput}
          normalized={fg}
        />
        <ColorInput
          label="Background"
          value={bgInput}
          onChange={setBgInput}
          normalized={bg}
        />
      </div>

      {valid ? (
        <PreviewSwatch color={fg} bg={bg} />
      ) : (
        <p className="text-sm text-muted-foreground">Enter valid hex codes (e.g. #3B82F6).</p>
      )}
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
  normalized,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  normalized: string | null;
}) {
  return (
    <div className="flex gap-3 items-center">
      <input
        type="color"
        value={normalized ?? "#000000"}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Pick ${label} color`}
        className="w-12 h-12 rounded-full cursor-pointer border-0 p-0 flex-shrink-0"
        style={{ background: "none" }}
      />
      <div className="flex-1">
        <label className="text-xs text-muted-foreground block mb-1">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#3B82F6"
          aria-label={`${label} hex code`}
          className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring font-mono"
        />
      </div>
    </div>
  );
}

function PreviewSwatch({ color, bg }: { color: string; bg: string }) {
  const ratio = contrastRatio(color, bg);
  const rating = rateContrast(ratio);
  const labelColor =
    contrastRatio(bg, "#000000") > contrastRatio(bg, "#ffffff") ? "#000" : "#fff";

  return (
    <div
      className="rounded-xl p-5 border border-white/10"
      style={{ backgroundColor: bg, color }}
    >
      <p className="text-2xl font-semibold mb-2">Aa</p>
      <p className="text-sm font-mono" style={{ color: labelColor, opacity: 0.8 }}>
        {ratio.toFixed(2)}:1 ·{" "}
        <span className={`inline-block px-1.5 py-0.5 rounded border text-xs ${ratingColor(rating)}`}>
          {rating}
        </span>
      </p>
    </div>
  );
}
