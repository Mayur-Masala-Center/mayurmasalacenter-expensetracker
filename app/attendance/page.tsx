"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";
import { Plus, X, UserMinus, CalendarDays } from "lucide-react";

type Staff = { id: string; name: string; active: boolean };
type Attendance = { staff_id: string; date: string; status: string };

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthDates(year: number, month: number) {
  const count = daysInMonth(year, month);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(year, month, i + 1);
    return d.toISOString().slice(0, 10);
  });
}

export default function AttendancePage() {
  const supabase = createClient();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [attendance, setAttendance] = useState<Map<string, string>>(new Map());
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const dates = getMonthDates(year, month);
  const monthLabel = new Date(year, month).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  async function load() {
    const { data: staff } = await supabase.from("staff").select("*").eq("active", true).order("name");
    setStaffList(staff || []);

    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${daysInMonth(year, month)}`;
    const { data: att } = await supabase
      .from("attendance")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate);

    const map = new Map<string, string>();
    (att || []).forEach((a: Attendance) => {
      map.set(`${a.staff_id}|${a.date}`, a.status);
    });
    setAttendance(map);
  }

  useEffect(() => { load(); }, [month, year]);

  async function addStaff() {
    if (!newName.trim()) return;
    setSaving(true);
    await supabase.from("staff").insert({ name: newName.trim() });
    setNewName("");
    setSaving(false);
    setShowAdd(false);
    load();
  }

  async function toggleAttendance(staffId: string, date: string) {
    const key = `${staffId}|${date}`;
    const current = attendance.get(key);
    const newStatus = current === "absent" ? "present" : "absent";

    if (current) {
      await supabase.from("attendance").update({ status: newStatus }).match({ staff_id: staffId, date });
    } else {
      await supabase.from("attendance").insert({ staff_id: staffId, date, status: "absent" });
    }

    const map = new Map(attendance);
    map.set(key, newStatus);
    setAttendance(map);
  }

  function getPresentCount(staffId: string) {
    let count = 0;
    dates.forEach((date) => {
      const status = attendance.get(`${staffId}|${date}`);
      if (status !== "absent") count++;
    });
    return count;
  }

  function getAbsentCount(staffId: string) {
    let count = 0;
    dates.forEach((date) => {
      const status = attendance.get(`${staffId}|${date}`);
      if (status === "absent") count++;
    });
    return count;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Nav />
      <main className="flex-1 p-4 md:p-6 space-y-5 pb-24">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Attendance</h1>
            <p className="text-masala-brown/60 text-sm">{monthLabel}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-masala-brown/20 hover:bg-masala-brown/5"
            >
              ← Prev
            </button>
            <button
              onClick={() => { const n = new Date(); setMonth(n.getMonth()); setYear(n.getFullYear()); }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-masala-brown/20 hover:bg-masala-brown/5"
            >
              Today
            </button>
            <button
              onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-masala-brown/20 hover:bg-masala-brown/5"
            >
              Next →
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="btn-primary flex items-center gap-1"
            >
              <Plus size={16} /> Add Staff
            </button>
          </div>
        </div>

        {/* Add staff modal */}
        {showAdd && (
          <div className="sheet-overlay" onClick={() => setShowAdd(false)}>
            <div className="sheet-panel animate-sheetUp" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-drag-handle" />
              <div className="sheet-header">
                <h3 className="font-bold text-lg">Add Staff</h3>
                <button onClick={() => setShowAdd(false)} className="tap-target -mr-2 text-masala-brown/50 hover:text-masala-red"><X size={20} /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); addStaff(); }} className="sheet-body pb-6">
                <div>
                  <label className="field-label">Name</label>
                  <input className="input" value={newName} autoFocus
                    onChange={(e) => setNewName(e.target.value)} required placeholder="Staff name" />
                </div>
                <button className="btn-primary w-full" disabled={saving}>
                  {saving ? "Adding..." : "Add Staff"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Staff cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staffList.map((staff) => {
            const present = getPresentCount(staff.id);
            const total = dates.length;
            return (
              <div key={staff.id} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-masala-gradient flex items-center justify-center text-masala-gold font-bold text-sm">
                      {staff.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{staff.name}</p>
                      <p className="text-xs text-masala-brown/60 flex items-center gap-1">
                        <CalendarDays size={12} />
                        {present} / {total} days present
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date grid */}
                <div className="grid grid-cols-7 gap-1">
                  {dates.map((date) => {
                    const key = `${staff.id}|${date}`;
                    const status = attendance.get(key);
                    const isAbsent = status === "absent";
                    const dayNum = new Date(date).getDate();
                    return (
                      <button
                        key={date}
                        onClick={() => toggleAttendance(staff.id, date)}
                        className={`aspect-square rounded-md text-xs font-medium flex items-center justify-center transition-colors ${
                          isAbsent
                            ? "bg-masala-red/15 text-masala-red"
                            : "bg-green-50 text-green-700 border border-green-200"
                        }`}
                        title={`${dayNum} ${monthLabel} — ${isAbsent ? "Absent" : "Present"}`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {staffList.length === 0 && (
          <div className="text-center py-12 text-masala-brown/50">
            <UserMinus size={40} className="mx-auto mb-3 opacity-50" />
            <p>No staff added yet.</p>
            <button onClick={() => setShowAdd(true)} className="btn-primary mt-4 inline-flex items-center gap-1">
              <Plus size={16} /> Add your first staff member
            </button>
          </div>
        )}

        {/* Summary table — all staff, this month */}
        {staffList.length > 0 && (
          <div className="card p-4 md:p-5">
            <h3 className="font-semibold mb-3">Attendance summary — {monthLabel}</h3>
            <div className="overflow-x-auto">
              <table className="data-table w-full min-w-[450px]">
                <thead>
                  <tr>
                    <th className="px-3">Staff</th>
                    <th className="px-3 text-right whitespace-nowrap">Present</th>
                    <th className="px-3 text-right whitespace-nowrap">Absent</th>
                    <th className="px-3 text-right whitespace-nowrap">Total</th>
                    <th className="px-3 text-right whitespace-nowrap">%</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((staff) => {
                    const present = getPresentCount(staff.id);
                    const absent = getAbsentCount(staff.id);
                    const total = dates.length;
                    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
                    return (
                      <tr key={staff.id}>
                        <td className="px-3 text-sm font-medium">{staff.name}</td>
                        <td className="px-3 text-right text-sm text-green-700">{present}</td>
                        <td className="px-3 text-right text-sm text-masala-red">{absent}</td>
                        <td className="px-3 text-right text-sm">{total}</td>
                        <td className="px-3 text-right text-sm">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}