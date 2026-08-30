"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";
import KpiCard from "@/components/KpiCard";
import DataTable from "@/components/DataTable";
import TrendChart from "@/components/TrendChart";
import { currentFinYear } from "@/lib/finance";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import QuickAdd from "@/components/QuickAdd";

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return router.replace("/login");
      loadData();
    });
  }, []);

  async function loadData() {
    const fy = currentFinYear();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const [fyStartYear] = fy.split("-");
    const fyStart = `${fyStartYear}-04-01`;

    async function sumWhere(type: string, gteDate?: string) {
      let q = supabase.from("transactions").select("amount").eq("type", type);
      if (gteDate) q = q.gte("txn_date", gteDate);
      const { data } = await q;
      return (data || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
    }

    // Get purchase vendors total for the period
    async function getPurchaseVendorsTotal(gteDate?: string) {
      let q = supabase.from("purchase_vendors").select("amount");
      if (gteDate) q = q.gte("date", gteDate);
      const { data } = await q;
      return (data || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
    }

    const [monthSale, monthPurchase, monthExpense, fySale, fyPurchase, fyExpense, recentRes, monthlyRes] = await Promise.all([
      sumWhere("sale", monthStart),
      getPurchaseVendorsTotal(monthStart),
      sumWhere("expense", monthStart),
      sumWhere("sale", fyStart),
      getPurchaseVendorsTotal(fyStart),
      sumWhere("expense", fyStart),
      supabase.from("transactions").select("txn_date,type,amount,category,description,source").order("txn_date", { ascending: false }).order("created_at", { ascending: false }).limit(15),
      supabase.from("v_monthly_summary").select("*").order("period", { ascending: true }).limit(36),
    ]);

    const chartMap: Record<string, any> = {};
    (monthlyRes.data || []).forEach((r: any) => {
      const key = new Date(r.period).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      chartMap[key] = chartMap[key] || { period: key, sale: 0, purchase: 0, expense: 0 };
      chartMap[key][r.type] = Number(r.total);
    });

    setData({
      fy,
      monthSale, monthPurchase, monthExpense,
      fySale, fyPurchase, fyExpense,
      recent: recentRes.data || [],
      chartData: Object.values(chartMap).slice(-12),
    });
    setLoading(false);
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-masala-brown/50">Loading...</p></div>;

  const { fy, monthSale, monthPurchase, monthExpense, fySale, fyPurchase, fyExpense, recent, chartData } = data;
  const monthNet = monthSale - monthPurchase - monthExpense;
  const fyNet = fySale - fyPurchase - fyExpense;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Nav />
      <main className="flex-1 p-4 md:p-6 space-y-5 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Overview</h1>
            <p className="text-masala-brown/60 text-xs md:text-sm">Financial year {fy}</p>
          </div>
          <QuickAdd />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <KpiCard label="This month — Sales" value={monthSale} icon={TrendingUp} />
          <KpiCard label="This month — Purchases" value={monthPurchase} icon={TrendingDown} />
          <KpiCard label="This month — Expenses" value={monthExpense} icon={Wallet} />
          <KpiCard label={`FY ${fy} — Net`} value={fyNet} icon={PiggyBank} />
        </div>
        <TrendChart data={chartData as any} />
        <DataTable rows={recent as any} title="Recent transactions" />
      </main>
    </div>
  );
}