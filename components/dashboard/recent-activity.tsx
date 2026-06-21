"use client";

import { cn } from "@/lib/utils";
import { IndianRupee, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface ActivityItem {
  id: string;
  type: string;
  from: string;
  amount: number;
  status: string;
  date: Date;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

// ── Framer Motion Variants ──
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }, // Slightly faster stagger for snappier feel
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -15, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 350, damping: 25 },
  },
} as const;

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_16px_40px_rgb(46,52,88,0.08)] h-full flex flex-col group/widget">
      {/* ── Refined Brand Ambient Glow ── */}
      <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-indigo-400/15 blur-[64px] pointer-events-none transition-transform duration-1000 group-hover/widget:scale-110" />
      <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-blue-400/10 blur-[64px] pointer-events-none transition-transform duration-1000 group-hover/widget:scale-110" />

      {/* ── Header ── */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            Recent Activity
          </h3>
          <p className="text-sm font-semibold text-slate-500/80 mt-1">
            Latest transactions & updates
          </p>
        </div>

        {/* Subtle Pill Header Button */}
        <button className="group flex items-center gap-1.5 rounded-full bg-white/60 backdrop-blur-md px-4 py-2 text-xs font-bold text-slate-600 shadow-sm border border-slate-200/50 transition-all duration-300 hover:bg-white hover:text-[#2e3458] hover:shadow-md hover:border-indigo-100 active:scale-95">
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* ── Activity List with Fade Mask ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        // This mask creates the beautiful fade-out effect at the bottom of the scrollable list
        className="relative z-10 space-y-2.5 flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] pb-4"
      >
        {activities.map((activity) => (
          <motion.div
            variants={itemVariants}
            key={activity.id}
            className="group relative flex items-center justify-between p-3.5 rounded-2xl bg-white/40 border border-transparent transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white/80 hover:border-white hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:scale-[1.015] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Dynamic Icon Container */}
              <div
                className={cn(
                  "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm border transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110 group-hover:rotate-[8deg]",
                  activity.status === "PAID"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                    : "bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]",
                )}
              >
                {activity.status === "PAID" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
              </div>

              <div className="overflow-hidden">
                <p className="text-sm font-extrabold text-slate-800 truncate transition-transform duration-300 group-hover:translate-x-1">
                  {activity.type}
                </p>
                <p className="text-xs font-semibold text-slate-500 truncate transition-transform duration-300 group-hover:translate-x-1">
                  from{" "}
                  <span className="font-bold text-slate-700">
                    {activity.from}
                  </span>
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 flex flex-col items-end">
              {/* Amount - Lights up slightly on hover */}
              <p
                className={cn(
                  "text-base font-black tracking-tight transition-all duration-300 group-hover:-translate-x-1",
                  activity.status === "PAID"
                    ? "text-emerald-600 group-hover:drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                    : "text-amber-600 group-hover:drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]",
                )}
              >
                +
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(activity.amount)}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 transition-transform duration-300 group-hover:-translate-x-1">
                {new Date(activity.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Empty State */}
        {activities.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            className="flex flex-col items-center justify-center h-full text-center py-12"
          >
            <div className="h-16 w-16 rounded-3xl bg-white/60 border border-slate-100 shadow-inner flex items-center justify-center mb-4 transition-transform hover:scale-105">
              <IndianRupee className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              No recent activity
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1 max-w-[200px]">
              Transactions and updates will appear here.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* ── Footer Button (Genie Shine & Lift Effect) ── */}
      <div className="relative z-10 mt-6 pt-0">
        <button className="group/btn relative w-full overflow-hidden rounded-xl bg-[#2e3458] px-5 py-3.5 text-sm font-bold text-white shadow-[0_4px_15px_rgba(46,52,88,0.2)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#232846] hover:shadow-[0_12px_30px_rgba(46,52,88,0.35)] hover:-translate-y-1 active:scale-95">
          {/* Sweeping Shine Effect */}
          <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover/btn:translate-x-[150%]" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            View Full History
            <ArrowRight className="w-4 h-4 opacity-50 transition-all duration-300 group-hover/btn:translate-x-1 group-hover/btn:opacity-100" />
          </span>
        </button>
      </div>
    </div>
  );
}
