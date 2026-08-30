export function currentFinYear(d = new Date()): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1; // 1-12
  return m >= 4 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

export function inr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}
