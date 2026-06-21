"use client";

import { useIsClient } from "@/lib/hooks/use-is-client";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";

interface ServiceTypesChartProps {
  data: { name: string; value: number }[];
}

const COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
  "#eab308",
];

export function ServiceTypesChart({ data }: ServiceTypesChartProps) {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full w-full animate-pulse min-h-[380px] flex flex-col justify-between">
        <div>
          <div className="h-6 w-48 bg-slate-200/60 rounded-md mb-2" />
        </div>
        <div className="h-[280px] w-full bg-slate-100/50 rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full w-full"
    >
      <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-6">
        Services Breakdown
      </h3>
      <div className="h-[300px] w-full pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ bottom: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={90}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
