"use client";

import {
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { UndervaluedEntry } from "@/lib/types";

/**
 * Expected auction price (x) vs IPL readiness (y). The undervalued cluster is
 * top-left: high readiness, low price. Single series; names are direct labels.
 */
export default function ValueScatter({ entries }: { entries: UndervaluedEntry[] }) {
  const data = entries.map((e) => ({
    name: e.player.name,
    price: e.expectedPriceLakh,
    readiness: e.player.readiness,
  }));

  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <h3 className="text-sm font-semibold text-ink-secondary">
        Readiness vs expected price — top-left is the value zone
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 48, left: -8, bottom: 8 }}>
            <CartesianGrid stroke="var(--grid)" />
            <XAxis
              type="number"
              dataKey="price"
              name="Expected price"
              unit="L"
              tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
              stroke="var(--baseline)"
              tickLine={false}
              label={{ value: "Expected price (₹ lakh)", position: "insideBottom", offset: -4, fill: "var(--ink-muted)", fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="readiness"
              name="Readiness"
              domain={[50, 100]}
              tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
              stroke="var(--baseline)"
              tickLine={false}
              label={{ value: "IPL readiness", angle: -90, position: "insideLeft", offset: 24, fill: "var(--ink-muted)", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "4 4", stroke: "var(--baseline)" }}
              formatter={(value, name) => (name === "Expected price" ? [`₹${value}L`, name] : [value, name])}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--foreground)",
              }}
            />
            <Scatter data={data} fill="var(--series-1)" stroke="var(--surface)" strokeWidth={2} r={8}>
              <LabelList dataKey="name" position="right" fill="var(--ink-secondary)" fontSize={11} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
