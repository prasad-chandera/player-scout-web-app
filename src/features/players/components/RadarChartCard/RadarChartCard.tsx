"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { SkillGroups } from "@/lib/types";

const LABELS: Record<keyof SkillGroups, string> = {
  batting: "Batting",
  bowling: "Bowling",
  fielding: "Fielding",
  pressure: "Pressure",
  consistency: "Consistency",
};

export interface RadarChartCardProps {
  name: string;
  skillGroups: SkillGroups;
}

/** Single-series skill radar; the card title carries identity (no legend needed). */
export function RadarChartCard({ name, skillGroups }: RadarChartCardProps) {
  const data = (Object.keys(LABELS) as (keyof SkillGroups)[]).map((k) => ({
    skill: LABELS[k],
    value: Math.round(skillGroups[k] * 100),
  }));

  return (
    <div className="card rounded-2xl p-4">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-secondary">Skill profile — {name}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="var(--grid)" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--ink-muted)", fontSize: 12 }} />
            <Tooltip
              formatter={(v) => [`${v} / 100`, "rating"]}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--foreground)",
              }}
            />
            <Radar
              dataKey="value"
              stroke="var(--series-1)"
              strokeWidth={2}
              fill="var(--series-1)"
              fillOpacity={0.25}
              dot={{ r: 3, fill: "var(--series-1)" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
