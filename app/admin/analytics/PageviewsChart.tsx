"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function PageviewsChart({
  data
}: {
  data: { day: string; pageviews: number }[];
}) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-[var(--fg)]/60">
        No pageviews yet in this window.
      </p>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted)" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted)" }} />
          <Tooltip
            contentStyle={{
              background: "var(--bg)",
              border: "1px solid var(--rule)",
              fontSize: 12
            }}
          />
          <Line
            type="monotone"
            dataKey="pageviews"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
