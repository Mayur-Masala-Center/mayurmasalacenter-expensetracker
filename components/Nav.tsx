"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutGrid, ShoppingCart, Receipt, LogOut, X, CalendarCheck, LineChart, HandCoins, Users, UserCheck, Grid3x3 } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/profit-loss", label: "P&L", icon: LineChart },
  { href: "/lending", label: "Lending", icon: HandCoins },
  { href: "/sale-vendors", label: "Sale Vendors", icon: Users },
  { href: "/purchase-vendors", label: "Purchase Vendors", icon: UserCheck },
];

// The 4 most-used destinations live permanently in the floating bottom bar;
// everything else (+ Sign out) sits behind "More" so the bar stays light and thumb-friendly.
const primaryMobileLinks = links.slice(0, 4);
const moreMobileLinks = links.slice(4);

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const isMoreActive = moreMobileLinks.some((l) => l.href === pathname);

  return (
    <>
      {/* ---------- Desktop sidebar ---------- */}
      <div className="hidden md:flex md:static inset-y-0 left-0 z-50 w-60 bg-masala-gradient-vivid text-masala-cream flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-masala-gold text-masala-brown font-bold flex items-center justify-center shadow-glow-gold">
            MM
          </div>
          <div className="flex-1">
            <p className="font-bold leading-tight">Mayur Masala</p>
            <p className="text-xs text-masala-cream/70">Center</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl2 text-sm font-medium transition-all",
                pathname === href
                  ? "bg-masala-gold text-masala-brown shadow-glow-gold"
                  : "hover:bg-white/10 text-masala-cream/90"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={logout}
          className="m-3 flex items-center gap-2 px-3 py-2.5 rounded-xl2 text-sm hover:bg-white/10 transition-all"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>

      {/* ---------- Mobile top bar (compact brand strip) ---------- */}
      <div className="top-bar">
        <div className="w-7 h-7 rounded-xl bg-masala-gold text-masala-brown font-bold text-xs flex items-center justify-center flex-shrink-0">
          MM
        </div>
        <p className="font-semibold text-sm truncate">Mayur Masala Center</p>
      </div>

      {/* ---------- Floating glass bottom tab bar (mobile) ---------- */}
      <nav className="bottom-nav">
        {primaryMobileLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={clsx("bottom-nav-item", active && "is-active")}>
              <Icon size={19} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
        <button onClick={() => setMoreOpen(true)} className={clsx("bottom-nav-item", isMoreActive && "is-active")}>
          <Grid3x3 size={19} strokeWidth={isMoreActive ? 2.4 : 2} />
          More
        </button>
      </nav>

      {/* Spacer so page content clears the floating bottom bar */}
      <div className="md:hidden h-24 flex-shrink-0" aria-hidden />

      {/* ---------- "More" bottom sheet (mobile) ---------- */}
      {moreOpen && (
        <div className="md:hidden sheet-overlay" onClick={() => setMoreOpen(false)}>
          <div className="sheet-panel animate-sheetUp" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-drag-handle" />
            <div className="sheet-header">
              <h3 className="font-bold text-lg">More</h3>
              <button onClick={() => setMoreOpen(false)} className="tap-target -mr-2 text-masala-brown/50 hover:text-masala-red"><X size={20} /></button>
            </div>
            <div className="sheet-body pb-6">
              <div className="grid grid-cols-2 gap-2.5">
                {moreMobileLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={clsx(
                      "flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl2 border-2 text-xs font-semibold transition-all",
                      pathname === href
                        ? "border-transparent text-white bg-masala-gradient-vivid shadow-glow-red"
                        : "border-masala-brown/10 text-masala-brown/70 bg-white/40"
                    )}
                  >
                    <Icon size={20} />
                    {label}
                  </Link>
                ))}
              </div>
              <button
                onClick={() => { setMoreOpen(false); logout(); }}
                className="btn-ghost flex items-center justify-center gap-2 w-full mt-1 text-masala-red border-masala-red/20"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
