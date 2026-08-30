import { inr } from "@/lib/finance";
import { LucideIcon } from "lucide-react";

export default function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "red",
}: {
  label: string;
  value: number;
  sub?: string;
  icon: LucideIcon;
  tone?: "red" | "gold" | "brown";
}) {
  return (
    <div className="kpi-card">
      <div className="absolute -right-4 -top-4 opacity-15">
        <Icon size={96} />
      </div>
      <p className="text-xs uppercase tracking-wide text-masala-gold/90 font-semibold">
        {label}
      </p>
      <p className="text-3xl font-bold mt-1">{inr(value)}</p>
      {sub && <p className="text-xs text-masala-cream/70 mt-1">{sub}</p>}
    </div>
  );
}
