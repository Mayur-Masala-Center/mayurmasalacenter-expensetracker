"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function TrendChart({
  data,
}: {
  data: { period: string; sale: number; purchase: number; expense: number }[];
}) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold mb-3">Monthly trend</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3B1F1420" />
          <XAxis dataKey="period" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Line type="monotone" dataKey="sale" stroke="#B4182A" strokeWidth={2} name="Sales" />
          <Line type="monotone" dataKey="purchase" stroke="#F2B90B" strokeWidth={2} name="Purchases" />
          <Line type="monotone" dataKey="expense" stroke="#3B1F14" strokeWidth={2} name="Expenses" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
