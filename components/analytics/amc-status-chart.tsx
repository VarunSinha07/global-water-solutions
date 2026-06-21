"use client";

import { useIsClient } from "@/lib/hooks/use-is-client";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

interface AMCStatusChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6b7280"];

export function AMCStatusChart({ data }: AMCStatusChartProps) {
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
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full w-full"
    >
      <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-6">
        AMC Contracts Status
      </h3>
      <div className="h-[300px] w-full pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ bottom: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={5}
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
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
