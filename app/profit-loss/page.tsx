"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";
import KpiCard from "@/components/KpiCard";
import { currentFinYear, inr } from "@/lib/finance";
import { PiggyBank, TrendingUp, TrendingDown, Wallet } from "lucide-react";

type Row = { period: string; sale: number; purchase: number; expense: number };

function pivot(rows: any[], periodKey: string): Row[] {
  const map = new Map<string, Row>();
  rows.forEach((r: any) => {
    const key = String(r[periodKey]);
    if (!map.has(key)) map.set(key, { period: key, sale: 0, purchase: 0, expense: 0 });
    (map.get(key) as any)[r.type] = Number(r.total);
  });
  return Array.from(map.values()).sort((a, b) => (a.period < b.period ? 1 : -1));
}

function NetTable({ title, rows, formatPeriod }: { title: string; rows: Row[]; formatPeriod: (p: string) => string }) {
  return (
    <div className="card p-4 md:p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="overflow-x-auto">
        <table className="data-table w-full min-w-[500px]">
          <thead>
            <tr>
              <th className="px-3 whitespace-nowrap">Period</th>
              <th className="px-3 text-right whitespace-nowrap">Sales</th>
              <th className="px-3 text-right whitespace-nowrap">Purchases</th>
              <th className="px-3 text-right whitespace-nowrap">Expenses</th>
              <th className="px-3 text-right whitespace-nowrap">Net</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="text-center text-masala-brown/50 py-6 px-3">No data yet.</td></tr>
            )}
            {rows.map((r) => {
              const net = r.sale - r.purchase - r.expense;
              return (
                <tr key={r.period}>
                  <td className="px-3 whitespace-nowrap text-sm">{formatPeriod(r.period)}</td>
                  <td className="px-3 text-right whitespace-nowrap text-sm">{inr(r.sale)}</td>
                  <td className="px-3 text-right whitespace-nowrap text-sm">{inr(r.purchase)}</td>
                  <td className="px-3 text-right whitespace-nowrap text-sm">{inr(r.expense)}</td>
                  <td className={`px-3 text-right whitespace-nowrap text-sm font-semibold ${net >= 0 ? "text-green-600" : "text-masala-red"}`}>
                    {net >= 0 ? "▲" : "▼"}{inr(net)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ProfitLossPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [monthlyRows, setMonthlyRows] = useState<Row[]>([]);
  const [yearlyRows, setYearlyRows] = useState<Row[]>([]);
  const [fyRows, setFyRows] = useState<Row[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return router.replace("/login");
      loadData();
    });
  }, []);

  async function loadData() {
    const [monthlyRes, yearlyRes, fyRes] = await Promise.all([
      supabase.from("v_monthly_summary").select("*").order("period", { ascending: false }).limit(48),
      supabase.from("v_yearly_summary").select("*").order("period", { ascending: false }),
      supabase.from("v_fy_summary").select("*"),
    ]);

    setMonthlyRows(pivot(monthlyRes.data || [], "period"));
    setYearlyRows(pivot(yearlyRes.data || [], "period"));

    const fyMap = new Map<string, Row>();
    (fyRes.data || []).forEach((r: any) => {
      const key = r.fin_year;
      if (!fyMap.has(key)) fyMap.set(key, { period: key, sale: 0, purchase: 0, expense: 0 });
      (fyMap.get(key) as any)[r.type] = Number(r.total);
    });
    setFyRows(Array.from(fyMap.values()).sort((a, b) => (a.period < b.period ? 1 : -1)));
    setLoading(false);
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-masala-brown/50">Loading...</p></div>;

  const fy = currentFinYear();
  const currentFyRow = fyRows.find((r) => r.period === fy) || { sale: 0, purchase: 0, expense: 0 };
  const currentFyNet = currentFyRow.sale - currentFyRow.purchase - currentFyRow.expense;
  const now = new Date();
  const thisMonthKey = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const thisMonthRow = monthlyRows.find((r) => r.period === thisMonthKey) || { sale: 0, purchase: 0, expense: 0 };
  const thisMonthNet = thisMonthRow.sale - thisMonthRow.purchase - thisMonthRow.expense;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Nav />
      <main className="flex-1 p-4 md:p-6 space-y-5 pb-24">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Profit & Loss</h1>
          <p className="text-masala-brown/60 text-sm">Net = Sales − Purchase − Expense</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="This month — Sales" value={thisMonthRow.sale} icon={TrendingUp} />
          <KpiCard label="This month — Purchase + Expense" value={thisMonthRow.purchase + thisMonthRow.expense} icon={Wallet} />
          <KpiCard label="This month — Net" value={thisMonthNet} icon={thisMonthNet >= 0 ? TrendingUp : TrendingDown} />
          <KpiCard label={`FY ${fy} — Net`} value={currentFyNet} icon={PiggyBank} />
        </div>
        <NetTable title="Monthly" rows={monthlyRows} formatPeriod={(p) => new Date(p).toLocaleDateString("en-IN", { month: "long", year: "numeric" })} />
        <NetTable title="Yearly (calendar year)" rows={yearlyRows} formatPeriod={(p) => new Date(p).getFullYear().toString()} />
        <NetTable title="Financial Year (Apr – Mar)" rows={fyRows} formatPeriod={(p) => `FY ${p}`} />
      </main>
    </div>
  );
}