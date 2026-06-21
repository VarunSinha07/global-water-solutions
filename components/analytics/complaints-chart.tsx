"use client";

import { useIsClient } from "@/lib/hooks/use-is-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface ComplaintsChartProps {
  data: { name: string; value: number }[];
}

export function ComplaintsChart({ data }: ComplaintsChartProps) {
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
      className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full w-full"
    >
      <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-6">
        Complaints by Status
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: -20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              strokeOpacity={0.4}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              fontSize={12}
              stroke="#94a3b8"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              fontSize={12}
              stroke="#94a3b8"
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
              }}
            />
            <Bar
              dataKey="value"
              fill="#4f5fa8"
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
