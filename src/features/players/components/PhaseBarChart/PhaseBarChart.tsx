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

export interface PhaseBarChartProps {
  role: Role;
  phaseStats: PhaseStat[];
}

/** Phase-wise economy (bowlers) or strike rate (batters); single hue, direct labels. */
export function PhaseBarChart({ role, phaseStats }: PhaseBarChartProps) {
  const isBatter = role === "batter";
  const metric = isBatter ? "Strike rate" : "Economy";
  const data = phaseStats.map((p) => ({
    phase: PHASE_LABEL[p.phase],
    value: (isBatter ? p.strikeRate : p.economy) ?? 0,
  }));

  return (
    <div className="card rounded-2xl p-4">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-secondary">{metric} by phase</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 24, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
            <defs>
              <linearGradient id="phase-bar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--brand)" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis dataKey="phase" tick={{ fill: "var(--ink-muted)", fontSize: 12 }} stroke="var(--baseline)" tickLine={false} />
            <YAxis tick={{ fill: "var(--ink-muted)", fontSize: 12 }} stroke="var(--baseline)" tickLine={false} />
            <Tooltip
              cursor={{ fill: "var(--chart-cursor)" }}
              formatter={(v) => [typeof v === "number" ? v.toFixed(1) : v, metric]}
              contentStyle={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--foreground)",
                boxShadow: "var(--shadow-1)",
              }}
            />
            <Bar dataKey="value" fill="url(#phase-bar)" radius={[6, 6, 0, 0]} maxBarSize={56}>
              <LabelList dataKey="value" position="top" fill="var(--ink-secondary)" fontSize={12} formatter={(v) => (typeof v === "number" ? v.toFixed(1) : String(v ?? ""))} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
