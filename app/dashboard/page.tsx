import {
  Users,
  FileText,
  AlertTriangle,
  MessageSquare,
  IndianRupee,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  getDashboardStats,
  getMonthlyRevenue,
  getRecentActivity,
} from "@/app/dashboard/actions";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { MetricCard } from "@/components/dashboard/metric-card";
import Link from "next/link";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const revenueData = await getMonthlyRevenue();
  const recentActivity = await getRecentActivity();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-sans">
            Dashboard Overview
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Welcome back! Here's your business at a glance.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/customers/new"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <Users className="mr-2 h-4 w-4" /> Add Customer
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="indigo"
          description="Active customer base"
          trend={{ value: 8, isPositive: true }}
        />

        <MetricCard
          title="Active AMCs"
          value={stats.activeAMCs}
          icon={FileText}
          color="green"
          description="Contracts currently active"
          trend={{ value: 12, isPositive: true }}
        />

        <MetricCard
          title="Pending Dues"
          value={`₹${stats.pendingAmount.toLocaleString("en-IN")}`}
          icon={IndianRupee}
          color="rose"
          description={`${stats.pendingAMCsCount} contracts pending`}
          trend={{ value: 2, isPositive: false }}
        />

        <MetricCard
          title="Open Complaints"
          value={stats.openComplaintsCount}
          icon={MessageSquare}
          color="orange"
          description="Requires attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <OverviewChart data={revenueData} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity activities={recentActivity} />
        </div>
      </div>
    </div>
  );
}
