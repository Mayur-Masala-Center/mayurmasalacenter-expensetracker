"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";
import { inr } from "@/lib/finance";
import { Plus, X, HandCoins, ArrowLeftRight, Clock, MessageCircle, Check, Send, Edit2, Trash2, Eye } from "lucide-react";
import NameDropdown from "@/components/NameDropdown";
import { lendingEntryMessage, lendingFollowUpMessage, whatsappLink } from "@/lib/whatsapp";

type LendingRow = {
  id: string;
  person_name: string;
  whatsapp_number: string | null;
  amount: number;
  paid_amount: number;
  type: "lend" | "settle";
  date: string;
  created_at: string;
};

type PersonSummary = {
  name: string;
  whatsapp_number: string | null;
  totalLent: number;
  totalSettled: number;
  remaining: number;
  firstDate: string;
  daysSince: number;
};

export default function LendingPage() {
  const supabase = createClient();
  const router = useRouter();
  const [rows, setRows] = useState<LendingRow[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingPerson, setViewingPerson] = useState<string | null>(null);
  const [form, setForm] = useState({
    person_name: "",
    whatsapp_number: "",
    amount: "",
    type: "lend" as "lend" | "settle",
    date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastEntry, setLastEntry] = useState<LendingRow | null>(null);
  const [lastRemaining, setLastRemaining] = useState(0);
  const [showWhatsAppPrompt, setShowWhatsAppPrompt] = useState(false);

  // Auto-fill person details when name changes
  useEffect(() => {
    if (form.person_name && rows.length > 0) {
      const existingPerson = rows.find(r => r.person_name === form.person_name);
      if (existingPerson) {
        setForm(prev => ({
          ...prev,
          whatsapp_number: existingPerson.whatsapp_number || prev.whatsapp_number,
        }));
      }
    }
  }, [form.person_name, rows]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return router.replace("/login");
      load();
    });
  }, []);

  async function load() {
    const { data } = await supabase.from("lending").select("*").order("date", { ascending: false });
    setRows(data || []);
    setLoading(false);
  }

  function resetForm() {
    setForm({
      person_name: "",
      whatsapp_number: "",
      amount: "",
      type: "lend",
      date: new Date().toISOString().slice(0, 10),
    });
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.person_name || !form.amount) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    const totalAmt = Number(form.amount);

    if (editingId) {
      const { error } = await supabase
        .from("lending")
        .update({
          person_name: form.person_name.trim(),
          whatsapp_number: form.whatsapp_number.trim() || null,
          amount: totalAmt,
          type: form.type,
          date: form.date,
        })
        .eq("id", editingId);

      if (error) {
        alert(`Failed to update: ${error.message}`);
        setSaving(false);
        return;
      }
      setSaving(false);
      resetForm();
      setShowAdd(false); // close the popup automatically once the entry is saved
      await load();
      return;
    }

    const { data: insertedData, error: insertError } = await supabase
      .from("lending")
      .insert({
        person_name: form.person_name.trim(),
        whatsapp_number: form.whatsapp_number.trim() || null,
        amount: totalAmt,
        type: form.type,
        date: form.date,
        created_by: user?.id,
      })
      .select();

    if (insertError) {
      alert(`Failed to save: ${insertError.message}`);
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowAdd(false); // always close the popup once the entry is saved

    if (insertedData && insertedData.length > 0) {
      const entry = insertedData[0] as LendingRow;
      setLastEntry(entry);
      // Work out this person's TOTAL outstanding balance (across all entries), so the
      // WhatsApp message reflects their real current balance, not just this one transaction.
      const personRows = [...rows.filter(r => r.person_name === entry.person_name), entry];
      const totalLent = personRows.filter(r => r.type === "lend").reduce((s, r) => s + r.amount, 0);
      const totalSettled = personRows.filter(r => r.type === "settle").reduce((s, r) => s + r.amount, 0);
      setLastRemaining(totalLent - totalSettled);
      if (entry.whatsapp_number) setShowWhatsAppPrompt(true);
    }

    resetForm();
    await load();
  }

  function startEdit(row: LendingRow) {
    setEditingId(row.id);
    setForm({
      person_name: row.person_name,
      whatsapp_number: row.whatsapp_number || "",
      amount: String(row.amount),
      type: row.type,
      date: row.date,
    });
    setShowAdd(true);
  }

  async function deleteEntry(id: string) {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    const { error } = await supabase.from("lending").delete().eq("id", id);
    if (error) {
      alert(`Failed to delete: ${error.message}`);
      return;
    }
    await load();
  }

  function sendWhatsApp(entry: LendingRow, remaining: number) {
    if (!entry.whatsapp_number) return;
    const message = lendingEntryMessage({
      person_name: entry.person_name,
      amount: entry.amount,
      remaining,
      type: entry.type,
      date: entry.date,
    });
    window.open(whatsappLink(entry.whatsapp_number, message), "_blank");
  }

  function sendFollowUpWhatsApp(personName: string, remaining: number, whatsapp: string) {
    const message = lendingFollowUpMessage({ person_name: personName, remaining });
    window.open(whatsappLink(whatsapp, message), "_blank");
  }

  // Compute per-person summary
  const personMap = new Map<string, { whatsapp_number: string | null; totalLent: number; totalSettled: number; firstDate: string }>();
  rows.forEach((r) => {
    const p = personMap.get(r.person_name) || { whatsapp_number: r.whatsapp_number, totalLent: 0, totalSettled: 0, firstDate: r.date };
    if (r.type === "lend") p.totalLent += r.amount;
    else p.totalSettled += r.amount;
    if (!p.whatsapp_number && r.whatsapp_number) p.whatsapp_number = r.whatsapp_number;
    if (r.date < p.firstDate) p.firstDate = r.date;
    personMap.set(r.person_name, p);
  });

  const summaries: PersonSummary[] = Array.from(personMap.entries()).map(([name, data]) => {
    const first = new Date(data.firstDate);
    const now = new Date();
    const diffMs = now.getTime() - first.getTime();
    const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return {
      name,
      whatsapp_number: data.whatsapp_number,
      totalLent: data.totalLent,
      totalSettled: data.totalSettled,
      remaining: data.totalLent - data.totalSettled,
      firstDate: data.firstDate,
      daysSince,
    };
  }).sort((a, b) => b.remaining - a.remaining);

  const uniqueNames = Array.from(new Set(rows.map((r) => r.person_name))).sort();
  const filteredRows = viewingPerson ? rows.filter((r) => r.person_name === viewingPerson) : rows;

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-masala-brown/50">Loading...</p></div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Nav />
      <main className="flex-1 p-4 md:p-6 space-y-5 pb-24">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Lending</h1>
            <p className="text-masala-brown/60 text-sm">Track money lent and settled</p>
          </div>
          <button onClick={() => { resetForm(); setShowAdd(true); }} className="btn-primary flex items-center gap-1.5">
            <Plus size={16} /> Add Entry
          </button>
        </div>

        {/* Person-wise widgets */}
        {summaries.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {summaries.map((s) => (
              <div key={s.name} className="card-interactive p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-masala-gradient flex items-center justify-center text-masala-gold font-bold text-sm">
                      {s.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      {s.whatsapp_number && (
                        <p className="text-xs text-masala-brown/50">{s.whatsapp_number}</p>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${s.remaining > 0 ? "text-masala-red" : "text-green-600"}`}>
                    {s.remaining > 0 ? `₹${s.remaining.toLocaleString("en-IN")}` : "Settled ✓"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-masala-brown/70">
                  <div>
                    <span className="block text-masala-brown/50">Lent</span>
                    <span className="font-medium text-masala-brown">{inr(s.totalLent)}</span>
                  </div>
                  <div>
                    <span className="block text-masala-brown/50">Got back</span>
                    <span className="font-medium text-green-700">{inr(s.totalSettled)}</span>
                  </div>
                  <div>
                    <span className="block text-masala-brown/50">Remaining</span>
                    <span className={`font-medium ${s.remaining > 0 ? "text-masala-red" : "text-green-600"}`}>{inr(s.remaining)}</span>
                  </div>
                  <div>
                    <span className="block text-masala-brown/50 flex items-center gap-1"><Clock size={10} /> Days</span>
                    <span className="font-medium">{s.daysSince} days</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setViewingPerson(viewingPerson === s.name ? null : s.name)}
                    className="flex-1 text-xs py-2 rounded-lg border border-masala-brown/20 hover:bg-masala-brown/5 flex items-center justify-center gap-1"
                  >
                    <Eye size={14} /> {viewingPerson === s.name ? "Show All" : "View History"}
                  </button>
                  {s.remaining > 0 && s.whatsapp_number && (
                    <button
                      onClick={() => sendFollowUpWhatsApp(s.name, s.remaining, s.whatsapp_number!)}
                      className="px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                      title="Send WhatsApp reminder"
                    >
                      <Send size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit entry modal */}
        {showAdd && (
          <div className="sheet-overlay" onClick={() => { setShowAdd(false); resetForm(); }}>
            <div className="sheet-panel animate-sheetUp" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-drag-handle" />
              <div className="sheet-header">
                <h3 className="font-bold text-lg">{editingId ? "Edit Entry" : "Lending Entry"}</h3>
                <button onClick={() => { setShowAdd(false); resetForm(); }} className="tap-target -mr-2 text-masala-brown/50 hover:text-masala-red"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="sheet-body pb-6">
                {/* Type selector */}
                <div className="grid grid-cols-2 gap-2">
                  {(["lend", "settle"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        form.type === t
                          ? t === "lend"
                            ? "border-masala-red bg-masala-red/5 text-masala-red"
                            : "border-green-600 bg-green-50 text-green-700"
                          : "border-masala-brown/10 text-masala-brown/60 hover:border-masala-brown/30"
                      }`}
                    >
                      {t === "lend" ? <HandCoins size={16} /> : <ArrowLeftRight size={16} />}
                      {t === "lend" ? "Lend" : "Settle"}
                    </button>
                  ))}
                </div>

                {/* Person name */}
                <div>
                  <label className="field-label">Person Name</label>
                  <NameDropdown
                    names={uniqueNames}
                    value={form.person_name}
                    onChange={(value) => setForm({ ...form, person_name: value })}
                    placeholder="Enter or select name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Amount (₹)</label>
                    <input className="input" type="number" required min="0" step="0.01" placeholder="0.00"
                      value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                  </div>
                  <div>
                    <label className="field-label">Date</label>
                    <input className="input" type="date" required
                      value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                </div>

                {/* WhatsApp number */}
                <div>
                  <label className="field-label">WhatsApp Number (optional)</label>
                  <input className="input" type="tel" placeholder="e.g. 9876543210"
                    value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} />
                </div>

                {form.person_name && (() => {
                  const personRows = rows.filter(r => r.person_name === form.person_name);
                  const totalLent = personRows.filter(r => r.type === "lend").reduce((sum, r) => sum + r.amount, 0);
                  const totalSettled = personRows.filter(r => r.type === "settle").reduce((sum, r) => sum + r.amount, 0);
                  const remaining = totalLent - totalSettled;
                  if (remaining > 0) {
                    return (
                      <div className="p-2.5 bg-masala-red/5 border border-masala-red/20 rounded-lg flex items-center justify-between">
                        <p className="text-xs text-masala-brown/60">Previous Balance</p>
                        <p className="text-base font-bold text-masala-red">₹{remaining.toLocaleString("en-IN")}</p>
                      </div>
                    );
                  }
                  return null;
                })()}

                <button className="btn-primary w-full" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Entry" : "Add Entry"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* WhatsApp notification after adding entry */}
        {showWhatsAppPrompt && lastEntry && lastEntry.whatsapp_number && (
          <div className="card p-4 border-2 border-green-200 bg-green-50/50 animate-pop">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check size={20} className="text-green-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">नोंद यशस्वीरित्या जतन झाली!</h3>
                <p className="text-sm text-green-700 mb-3">
                  {lastEntry.person_name} — {lastEntry.type === "lend" ? "उधार दिली" : "परतफेड मिळाली"} ₹{lastEntry.amount.toLocaleString("en-IN")}
                  {lastRemaining > 0 && ` • बाकी: ₹${lastRemaining.toLocaleString("en-IN")}`}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { sendWhatsApp(lastEntry, lastRemaining); setShowWhatsAppPrompt(false); }}
                    className="btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <MessageCircle size={18} /> WhatsApp पाठवा
                  </button>
                  <button
                    onClick={() => setShowWhatsAppPrompt(false)}
                    className="px-4 py-2 text-sm text-masala-brown/60 hover:text-masala-brown"
                  >
                    नंतर
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All transactions table */}
        {filteredRows.length > 0 && (
          <div className="card p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                {viewingPerson ? `${viewingPerson} - Transaction History` : "All Transactions"}
              </h3>
              {viewingPerson && (
                <button onClick={() => setViewingPerson(null)} className="text-sm text-masala-brown/60 hover:text-masala-brown">
                  Show All
                </button>
              )}
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="data-table w-full min-w-[500px]">
                <thead>
                  <tr>
                    <th className="px-3">Date</th>
                    <th className="px-3">Person</th>
                    <th className="px-3">Type</th>
                    <th className="px-3 text-right">Amount</th>
                    <th className="px-3 text-right">Paid</th>
                    <th className="px-3 text-right">Balance</th>
                    <th className="px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => {
                    const balance = r.amount - r.paid_amount;
                    return (
                      <tr key={r.id}>
                        <td className="px-3 whitespace-nowrap text-sm">{new Date(r.date).toLocaleDateString("en-IN")}</td>
                        <td className="px-3 text-sm font-medium">{r.person_name}</td>
                        <td className="px-3 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.type === "lend" ? "bg-masala-red/10 text-masala-red" : "bg-green-50 text-green-700"
                          }`}>
                            {r.type === "lend" ? "Lent" : "Settled"}
                          </span>
                        </td>
                        <td className="px-3 text-right whitespace-nowrap text-sm">{inr(r.amount)}</td>
                        <td className="px-3 text-right whitespace-nowrap text-sm text-green-700">{inr(r.paid_amount)}</td>
                        <td className="px-3 text-right whitespace-nowrap text-sm font-medium text-masala-red">{inr(balance)}</td>
                        <td className="px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => startEdit(r)}
                              className="p-1.5 rounded-md hover:bg-blue-50 text-masala-brown/60 hover:text-blue-700"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => deleteEntry(r.id)}
                              className="p-1.5 rounded-md hover:bg-red-50 text-masala-brown/60 hover:text-masala-red"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                            {r.whatsapp_number && (() => {
                              const personTotal = personMap.get(r.person_name);
                              const remaining = personTotal ? personTotal.totalLent - personTotal.totalSettled : balance;
                              return (
                                <button
                                  onClick={() => sendFollowUpWhatsApp(r.person_name, remaining, r.whatsapp_number!)}
                                  className="p-1.5 rounded-md hover:bg-green-50 text-masala-brown/60 hover:text-green-700"
                                  title="Send reminder"
                                >
                                  <Send size={14} />
                                </button>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {summaries.length === 0 && (
          <div className="text-center py-12 text-masala-brown/50">
            <HandCoins size={40} className="mx-auto mb-3 opacity-50" />
            <p>No lending entries yet.</p>
            <button onClick={() => { resetForm(); setShowAdd(true); }} className="btn-primary mt-4 inline-flex items-center gap-1">
              <Plus size={16} /> Add your first lending entry
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
