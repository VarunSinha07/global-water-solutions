"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface AMCModalProps {
  amc: any;
  isOpen: boolean;
  onClose: () => void;
}

export function AMCModal({ amc, isOpen, onClose }: AMCModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !amc) return null;

  // Calculate pending amount correctly
  const paidAmount = amc.payments
    ? amc.payments
        .filter((p: any) => p.status === "PAID")
        .reduce((sum: number, p: any) => sum + p.amount, 0)
    : 0;
  const pendingAmount = amc.amount - paidAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-gray-950/25 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg transform rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-gray-900">Contract Details</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Customer Section */}
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500 mb-1">Customer</p>
            <div className="font-bold text-gray-900 text-lg">
              {amc.customer.name}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              {amc.customer.phone || "+91 87654 32109"}
            </div>
          </div>

          {/* Service Section */}
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500 mb-1">Service</p>
            <div className="font-bold text-gray-900 text-lg">
              {amc.service.serviceType}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gray-50 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Start Date</p>
              <p className="font-bold text-gray-900 text-lg">
                {new Date(amc.startDate).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">End Date</p>
              <p className="font-bold text-gray-900 text-lg">
                {new Date(amc.endDate).toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="bg-[#eef2ff] p-4 rounded-2xl text-center">
              <div className="text-2xl font-extrabold text-[#4f46e5]">
                ₹{amc.amount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">Contract Amount</div>
            </div>

            <div className="text-center rounded-2xl p-4 bg-gray-50 border border-gray-100 h-full flex flex-col justify-center items-center">
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ring-1 ring-inset uppercase tracking-wide",
                  amc.status === "EXPIRED"
                    ? "bg-red-50 text-red-700 ring-red-600/10"
                    : pendingAmount > 0
                      ? "bg-orange-50 text-orange-700 ring-orange-600/20"
                      : "bg-green-50 text-green-700 ring-green-600/20",
                )}
              >
                {amc.status === "EXPIRED"
                  ? "EXPIRED"
                  : pendingAmount > 0
                    ? "PENDING"
                    : "ACTIVE"}
              </span>
              <div className="text-xs text-gray-500 mt-2">Status</div>
            </div>
          </div>

          {/* Pending Amount - Only shown if pending payment */}
          {pendingAmount > 0 && amc.status !== "EXPIRED" && (
            <div className="bg-orange-50 rounded-2xl p-4 text-center border border-orange-100">
              <p className="text-xs text-orange-600 font-medium uppercase tracking-wider mb-1">
                Outstanding Balance
              </p>
              <p className="text-2xl font-bold text-orange-700">
                ₹{pendingAmount.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
