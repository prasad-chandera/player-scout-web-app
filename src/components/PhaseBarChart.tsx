"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PhaseStat, Role } from "@/lib/types";

const PHASE_LABEL: Record<PhaseStat["phase"], string> = {
  powerplay: "Powerplay (1–6)",
  middle: "Middle (7–15)",
  death: "Death (16–20)",
};

/** Phase-wise economy (bowlers) or strike rate (batters); single hue, direct labels. */
export default function PhaseBarChart({ role, phaseStats }: { role: Role; phaseStats: PhaseStat[] }) {
  const isBatter = role === "batter";
  const metric = isBatter ? "Strike rate" : "Economy";
  const data = phaseStats.map((p) => ({
    phase: PHASE_LABEL[p.phase],
    value: (isBatter ? p.strikeRate : p.economy) ?? 0,
  }));

  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <h3 className="text-sm font-semibold text-ink-secondary">{metric} by phase</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 24, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis dataKey="phase" tick={{ fill: "var(--ink-muted)", fontSize: 12 }} stroke="var(--baseline)" tickLine={false} />
            <YAxis tick={{ fill: "var(--ink-muted)", fontSize: 12 }} stroke="var(--baseline)" tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              formatter={(v) => [typeof v === "number" ? v.toFixed(1) : v, metric]}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--foreground)",
              }}
            />
            <Bar dataKey="value" fill="var(--series-1)" radius={[4, 4, 0, 0]} maxBarSize={56}>
              <LabelList dataKey="value" position="top" fill="var(--ink-secondary)" fontSize={12} formatter={(v) => (typeof v === "number" ? v.toFixed(1) : String(v ?? ""))} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
