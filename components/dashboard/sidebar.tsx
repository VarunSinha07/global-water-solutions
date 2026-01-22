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
  BarChart3, // Using for Analytics as per previous code, looks like a pie chart in image?
  LogOut,
  Settings,
  PieChart, // Switching to PieChart if available, or just keeping BarChart3
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Services", href: "/dashboard/services", icon: Wrench },
  { name: "AMC Contracts", href: "/dashboard/amcs", icon: FileText },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Complaints", href: "/dashboard/complaints", icon: MessageSquare },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export function Sidebar() {
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
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-100/50 transition-all duration-300">
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-gray-900">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 shadow-lg shadow-indigo-200">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600" />
            <div className="relative h-2.5 w-2.5 rounded-full bg-white ring-4 ring-white/20" />
          </div>
          <span>WaterSol ERP</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname?.startsWith(`${item.href}/`) &&
                item.href !== "/dashboard");
            // Adjusted isActive logic so /dashboard doesn't match everything
            // But /dashboard is root of dashboard.
            // If pathname is /dashboard, then Dashboard is active.
            // If pathname is /dashboard/customers, then Customers is active.
            // Logic: strict match for root, prefix match for others?

            const isOverview = item.href === "/dashboard";
            const isCurrent = isOverview
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                  isCurrent
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                {isCurrent && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
                )}
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isCurrent
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-500",
                  )}
                  aria-hidden="true"
                />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Settings Area */}
      {/* Not explicitly in the screenshot attached to this request, but usually good to keep settings */}
      {/* Assuming we want to keep it minimal as per "Sidebar like this" which ends at Analytics */}
      {/* I will keep Settings/SignOut but style them to match */}

      <div className="p-4 mt-auto">
        <div className="border-t border-gray-100 pt-4 space-y-1">
          <Link
            href="/dashboard/settings"
            className={cn(
              "group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900",
              pathname?.startsWith("/dashboard/settings") &&
                "bg-gray-100 text-gray-900",
            )}
          >
            <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
