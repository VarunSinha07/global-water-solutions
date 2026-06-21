"use client";

import { useState } from "react";
import { useIsClient } from "@/lib/hooks/use-is-client";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface OverviewChartProps {
  data: Record<
    string,
    {
      name: string;
      revenue: number;
    }[]
  >;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white/90 backdrop-blur-xl border border-white/60 p-4 rounded-2xl shadow-[0_16px_40px_-10px_rgba(46,52,88,0.2)]"
      >
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
          {label}
        </p>
        <div className="flex items-center gap-3">
          {/* Pulsing indicator dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
          </span>
          <span className="text-[#2e3458] text-2xl font-black tracking-tight">
            ₹{payload[0].value.toLocaleString()}
          </span>
        </div>
      </motion.div>
    );
  }
  return null;
};

export function OverviewChart({ data }: OverviewChartProps) {
  const [period, setPeriod] = useState<"6M" | "1Y" | "ALL">("6M");
  const isClient = useIsClient();

  const displayData = data[period] || [];

  if (!isClient) {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full w-full animate-pulse flex flex-col justify-between min-h-[400px]">
        <div>
          <div className="h-6 w-48 bg-slate-200/60 rounded-md mb-2" />
          <div className="h-4 w-64 bg-slate-200/60 rounded-md" />
        </div>
        <div className="h-[280px] w-full bg-slate-100/50 rounded-2xl mt-8" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_16px_40px_rgb(46,52,88,0.06)] hover:bg-white/50 h-full flex flex-col"
    >
      {/* Ambient Inner Glow */}
      <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      {/* ── Header Area ── */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Revenue Analytics
          </h3>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Monthly revenue collection tracking
          </p>
        </div>

        {/* ── Custom Glassmorphic Dropdown ── */}
        <div className="relative group">
          <select
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none"
            value={period}
            onChange={(e) => setPeriod(e.target.value as "6M" | "1Y" | "ALL")}
          >
            <option value="6M" className="text-slate-800 bg-white">
              Last 6 Months
            </option>
            <option value="1Y" className="text-slate-800 bg-white">
              Last Year
            </option>
            <option value="ALL" className="text-slate-800 bg-white">
              All Time
            </option>
          </select>
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-xl px-4 py-2.5 shadow-sm transition-all duration-300 group-hover:bg-white/90 group-hover:shadow-md group-hover:border-indigo-200">
            <span className="text-sm font-bold text-slate-600 group-hover:text-[#2e3458] transition-colors">
              {period === "6M"
                ? "Last 6 Months"
                : period === "1Y"
                  ? "Last Year"
                  : "All Time"}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-300 group-hover:text-indigo-500 group-hover:rotate-180" />
          </div>
        </div>
      </div>

      {/* ── Chart Area ── */}
      <div className="relative z-10 w-full mt-4 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={displayData}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f5fa8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4f5fa8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#cbd5e1"
              strokeOpacity={0.4}
            />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={12}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              dy={15}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              dx={-10}
              tickFormatter={(value) =>
                `₹${value >= 1000 ? `${value / 1000}k` : value}`
              }
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#a5b4fc",
                strokeWidth: 2,
                strokeDasharray: "4 4",
              }}
              isAnimationActive={true}
              animationDuration={200}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#4f5fa8"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              activeDot={{
                r: 6,
                strokeWidth: 4,
                stroke: "#ffffff",
                fill: "#2e3458",
                className: "shadow-[0_0_15px_rgba(46,52,88,0.5)]",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
