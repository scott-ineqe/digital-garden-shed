import { contrastRatio, rateContrast, ratingColor } from "@/lib/contrast";

export function ContrastBadges({ hex }: { hex: string }) {
  const rWhite = contrastRatio(hex, "#ffffff");
  const rBlack = contrastRatio(hex, "#000000");
  const ratingWhite = rateContrast(rWhite);
  const ratingBlack = rateContrast(rBlack);

  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <Row label="White bg" ratio={rWhite} rating={ratingWhite} />
      <Row label="Black bg" ratio={rBlack} rating={ratingBlack} />
    </div>
  );
}

function Row({
  label,
  ratio,
  rating,
}: {
  label: string;
  ratio: number;
  rating: ReturnType<typeof rateContrast>;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5">
        <span className="font-mono text-[11px] text-muted-foreground">{ratio.toFixed(2)}:1</span>
        <span className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${ratingColor(rating)}`}>
          {rating}
        </span>
      </span>
    </div>
  );
}
