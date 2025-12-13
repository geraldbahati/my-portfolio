"use client";

import { Doc } from "@/convex/_generated/dataModel";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

interface ProjectMetricsProps {
  metrics: Doc<"projectMetrics">[];
}

// Radial chart component for a single metric
function MetricRadialChart({
  value,
  label,
  percent,
  color,
}: {
  value: string;
  label: string;
  percent: number;
  color: string;
}) {
  const chartData = [{ metric: label, value: percent, fill: color }];

  const chartConfig = {
    value: {
      label: label,
    },
    metric: {
      label: label,
      color: color,
    },
  } satisfies ChartConfig;

  // Calculate end angle based on percent (0-100 mapped to 0-360)
  const endAngle = (percent / 100) * 360;

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[200px] w-full"
    >
      <RadialBarChart
        data={chartData}
        startAngle={90}
        endAngle={90 - endAngle}
        innerRadius={70}
        outerRadius={95}
      >
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          className="first:fill-muted last:fill-background"
          polarRadius={[76, 64]}
        />
        <RadialBar dataKey="value" background cornerRadius={10} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {value}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
}

// Color palette for metrics
const METRIC_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ProjectMetrics({ metrics }: ProjectMetricsProps) {
  if (metrics.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {metrics.map((metric, index) => {
            // Parse percent from value if it contains %, otherwise use a default
            const percentMatch = metric.value.match(/(\d+)/);
            const percent = percentMatch ? parseInt(percentMatch[1], 10) : 50;

            return (
              <div
                key={metric._id}
                className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500 fill-mode-both"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MetricRadialChart
                  value={metric.value}
                  label={metric.label}
                  percent={Math.min(percent, 100)}
                  color={METRIC_COLORS[index % METRIC_COLORS.length]}
                />

                <div className="mt-4 text-sm md:text-base font-medium text-foreground tracking-wide">
                  {metric.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
