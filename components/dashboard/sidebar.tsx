"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Wrench,
  FileText,
  CreditCard,
  MessageSquare,
  BarChart3,
  LogOut,
  Settings,
  ChevronRight,
  Shield,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Services", href: "/dashboard/services", icon: Wrench },
  { name: "AMC Contracts", href: "/dashboard/amcs", icon: FileText },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Complaints", href: "/dashboard/complaints", icon: MessageSquare },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "User Management", href: "/dashboard/users", icon: Shield },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  return (
    <div className="flex h-full w-[280px] flex-col bg-white/40 backdrop-blur-2xl border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative z-20">
      
      {/* ── Brand Header ── */}
      <div className="flex h-24 items-center justify-between px-8 relative">
        <div className="flex items-center gap-4 font-black text-2xl tracking-tight text-slate-800">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2e3458] to-[#4f5fa8] shadow-[0_4px_12px_rgba(46,52,88,0.3)]">
            <div className="absolute inset-0 rounded-2xl border border-white/20" />
            <div className="relative h-3 w-3 rounded-full bg-white shadow-sm" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">
            GWS ERP
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 lg:hidden rounded-xl hover:bg-slate-100/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ── Main Navigation ── */}
      <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
        <div className="px-4 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Main Menu
          </p>
        </div>
        
        <nav className="space-y-1.5 relative">
          {navigation.map((item) => {
            const isOverview = item.href === "/dashboard";
            const isCurrent = isOverview
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-colors duration-300 outline-none",
                  isCurrent ? "text-[#2e3458]" : "text-slate-500 hover:text-slate-800"
                )}
              >
                {/* ── Framer Motion Active Background ── */}
                {isCurrent && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200/60"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                {/* ── Framer Motion Active Accent Pill ── */}
                {isCurrent && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute left-0 top-[15%] h-[70%] w-1.5 rounded-r-full bg-[#2e3458] shadow-[0_0_10px_rgba(46,52,88,0.4)]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                <div className="relative z-10 flex items-center">
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                      isCurrent
                        ? "text-[#2e3458]"
                        : "text-slate-400 group-hover:text-slate-500 group-hover:scale-110"
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </div>

                {/* Subtle hover arrow */}
                <ChevronRight 
                  className={cn(
                    "relative z-10 w-4 h-4 transition-all duration-300 ease-out opacity-0 -translate-x-2",
                    !isCurrent && "group-hover:opacity-100 group-hover:translate-x-0 text-slate-300"
                  )} 
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Footer / Settings Area ── */}
      <div className="p-4 mt-auto">
        <div className="border-t border-slate-200/60 pt-4 space-y-1.5 px-4 pb-4">
          
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className={cn(
              "group relative flex items-center rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300",
              pathname?.startsWith("/dashboard/settings")
                ? "bg-white text-[#2e3458] shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-800"
            )}
          >
            <Settings className="mr-3 h-5 w-5 text-slate-400 transition-transform duration-500 group-hover:rotate-90 group-hover:text-slate-500" />
            <span>Settings</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="group relative flex w-full items-center rounded-2xl px-4 py-3 text-sm font-bold text-red-500 transition-all duration-300 overflow-hidden hover:bg-red-50 hover:shadow-sm hover:border-red-100 border border-transparent"
          >
            {/* Sweeping Shine Effect on Logout */}
            <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-red-100/40 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-[150%]" />
            
            <LogOut className="relative z-10 mr-3 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="relative z-10">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}