"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="card w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-masala-gradient flex items-center justify-center text-masala-gold font-bold text-lg">
            MM
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Mayur Masala</h1>
            <p className="text-xs text-masala-brown/60">Center Dashboard</p>
          </div>
        </div>
        <label className="text-sm font-medium">Email</label>
        <input className="input mt-1 mb-4" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <label className="text-sm font-medium">Password</label>
        <input className="input mt-1 mb-4" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-masala-red text-sm mb-3">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="text-xs text-masala-brown/50 mt-4">
          Accounts are created by the admin in Supabase — no self sign-up.
        </p>
      </form>
    </div>
  );
}
