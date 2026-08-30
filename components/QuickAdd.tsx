"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, ShoppingCart, Receipt, HandCoins, ArrowLeftRight } from "lucide-react";

const types = [
  { key: "sale", label: "Sale", icon: ShoppingCart },
  { key: "expense", label: "Expense", icon: Receipt },
  { key: "lending", label: "Lending", icon: HandCoins },
] as const;

export default function QuickAdd({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"sale" | "expense" | "lending">("sale");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [lendType, setLendType] = useState<"lend" | "settle">("lend");
  const [personName, setPersonName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (type === "lending") {
      if (!personName) return;
      await supabase.from("lending").insert({
        person_name: personName.trim(),
        amount: Number(amount),
        type: lendType,
        date: new Date().toISOString().slice(0, 10),
        created_by: user?.id,
      });
      setPersonName("");
      setAmount("");
      setSaving(false);
      setOpen(false);
      onDone?.();
      return;
    }

    await supabase.from("transactions").insert({
      type: type as "sale" | "purchase" | "expense",
      amount: Number(amount),
      category: category || null,
      txn_date: new Date().toISOString().slice(0, 10),
      source: "web",
      created_by: user?.id,
    });
    setAmount("");
    setCategory("");
    setSaving(false);
    setOpen(false);
    onDone?.();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-10 h-10 rounded-full bg-masala-red text-white shadow-lg hover:bg-masala-redDeep transition-colors flex items-center justify-center flex-shrink-0"
        title="Quick add"
      >
        <Plus size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-masala-cream w-full md:max-w-sm rounded-t-2xl md:rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Quick Add</h3>
              <button onClick={() => setOpen(false)} className="p-1 hover:text-masala-red"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-4 gap-1.5">
                {types.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setType(t.key)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-[10px] font-medium transition-all ${
                      type === t.key
                        ? "border-masala-red bg-masala-red/5 text-masala-red"
                        : "border-masala-brown/10 text-masala-brown/60 hover:border-masala-brown/30"
                    }`}
                  >
                    <t.icon size={18} />
                    {t.label}
                  </button>
                ))}
              </div>

              {type === "lending" && (
                <div className="grid grid-cols-2 gap-2">
                  {(["lend", "settle"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLendType(t)}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        lendType === t
                          ? t === "lend"
                            ? "border-masala-red bg-masala-red/5 text-masala-red"
                            : "border-green-600 bg-green-50 text-green-700"
                          : "border-masala-brown/10 text-masala-brown/60"
                      }`}
                    >
                      {t === "lend" ? <HandCoins size={16} /> : <ArrowLeftRight size={16} />}
                      {t === "lend" ? "Lend" : "Settle"}
                    </button>
                  ))}
                </div>
              )}

              {type === "lending" && (
                <div>
                  <label className="text-sm font-medium">Person Name</label>
                  <input className="input mt-1" value={personName} required
                    onChange={(e) => setPersonName(e.target.value)} placeholder="Enter name" />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Amount (₹)</label>
                <input className="input mt-1" type="number" required min="0" step="0.01" placeholder="0.00" autoFocus
                  value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>

              {type !== "lending" && (
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <input className="input mt-1" placeholder="e.g. Garam Masala, Rent..."
                    value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
              )}

              <button className="btn-primary w-full py-3" disabled={saving}>
                {saving ? "Saving..." : type === "lending" ? (lendType === "lend" ? "Add Lend" : "Add Settle") : `Add ${type}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}