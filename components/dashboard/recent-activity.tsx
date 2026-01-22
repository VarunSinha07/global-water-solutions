"use client";

import { cn } from "@/lib/utils";
import { DollarSign } from "lucide-react";

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

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-2">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110",
                  activity.status === "PAID"
                    ? "bg-green-50 text-green-600 ring-4 ring-green-50/50"
                    : "bg-orange-50 text-orange-600 ring-4 ring-orange-50/50",
                )}
              >
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {activity.type}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  from{" "}
                  <span className="font-medium text-gray-700">
                    {activity.from}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-gray-900">
                +
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(activity.amount)}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">Just now</p>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
            <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
              <DollarSign className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium">No recent activity</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50">
        <button className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all active:scale-[0.98]">
          View Full History
        </button>
      </div>
    </div>
  );
}
