"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AMCModal } from "./amc-modal";

interface AMCsGridProps {
  amcs: any[];
  referenceDate?: Date;
}

export function AMCsGrid({ amcs, referenceDate }: AMCsGridProps) {
  const [selectedAMC, setSelectedAMC] = useState<any>(null);

  const now = referenceDate || new Date();

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {amcs.map((amc) => {
          const startDate = new Date(amc.startDate);
          const endDate = new Date(amc.endDate);
          const totalDuration = endDate.getTime() - startDate.getTime();
          const elapsed = now.getTime() - startDate.getTime();
          let progress = (elapsed / totalDuration) * 100;
          progress = Math.min(Math.max(progress, 0), 100);

          const isExpired = endDate < now || amc.status === "EXPIRED";

          // Payment Calculations
          const paidAmount = amc.payments
            .filter((p: any) => p.status === "PAID")
            .reduce((sum: number, p: any) => sum + p.amount, 0);
          const pendingAmount = amc.amount - paidAmount;

          const displayStatus = isExpired
            ? "Expired"
            : pendingAmount > 0
              ? "Pending Payment"
              : "Active";

          const statusColor = isExpired
            ? "bg-red-50 text-red-700 ring-red-600/10"
            : pendingAmount > 0
              ? "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
              : "bg-green-50 text-green-700 ring-green-600/20";

          return (
            <div
              key={amc.id}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/50 transition-all hover:shadow-md hover:border-indigo-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {amc.customer.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {amc.service.serviceType}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset uppercase",
                    statusColor,
                  )}
                >
                  {displayStatus}
                </span>
              </div>

              <div className="mb-6 space-y-4">
                {/* Contract Progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500">Contract Progress</span>
                    <span className="font-medium text-gray-900">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#312e81] rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-50">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Start</p>
                  <p className="text-sm font-medium text-gray-900">
                    {startDate.toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">End</p>
                  <p className="text-sm font-medium text-gray-900">
                    {endDate.toLocaleDateString("en-GB")}
                  </p>
                </div>

                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Amount</p>
                  <p className="text-sm font-medium text-[#4f46e5]">
                    ₹{amc.amount.toLocaleString()}
                  </p>
                </div>

                <div className="mt-2 text-right">
                  <p className="text-xs text-gray-500 mb-1">End</p>
                  <p className="text-sm font-medium text-gray-900">
                    {endDate.toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedAMC(amc)}
                  className="flex items-center justify-center rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Details
                </button>
                {isExpired ? (
                  <Link
                    href={`/dashboard/amcs/${amc.id}/renew`}
                    className="flex items-center justify-center rounded-lg bg-[#312e81] px-3 py-2.5 text-sm font-medium text-white hover:bg-[#23215e] transition-colors"
                  >
                    Renew
                  </Link>
                ) : pendingAmount > 0 ? (
                  <Link
                    href={`/dashboard/payments/new?amcId=${amc.id}`}
                    className="flex items-center justify-center rounded-lg bg-[#312e81] px-3 py-2.5 text-sm font-medium text-white hover:bg-[#23215e] transition-colors"
                  >
                    Pay Dues
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
                  >
                    Paid
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AMCModal
        amc={selectedAMC}
        isOpen={!!selectedAMC}
        onClose={() => setSelectedAMC(null)}
      />
    </>
  );
}
