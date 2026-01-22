"use client";

import { X, Wrench } from "lucide-react";
import { useEffect } from "react";

interface ServiceModalProps {
  service: {
    id: string;
    serviceType: string;
    installationDate: string | Date;
    customer: {
      name: string;
      phone?: string;
    };
    _count?: {
      amcContracts: number;
      complaints: number;
    };
  }; 
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceModal({ service, isOpen, onClose }: ServiceModalProps) {
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

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-gray-950/25 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg transform rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-gray-900">Service Details</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-start gap-4 mb-8">
          <div className="rounded-full bg-blue-600 p-3 text-white shadow-sm shadow-blue-200">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900">
              {service.serviceType}
            </h4>
            <p className="text-sm text-gray-500 mt-0.5 font-mono">
              ID: {service.id.split("-")[0]}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs text-gray-500 mb-1">Customer</p>
            <div className="font-semibold text-gray-900 text-lg leading-tight">
              {service.customer.name}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {service.customer.phone || "+91 98765 43210"}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Installation Date</p>
            <div className="font-semibold text-gray-900 text-lg">
              {new Date(service.installationDate).toLocaleDateString("en-GB")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl bg-gray-50 p-4 text-center border border-gray-100">
            <div className="text-3xl font-bold text-indigo-600 mb-1">
              {service._count?.amcContracts || 0}
            </div>
            <div className="text-xs font-medium text-gray-500">
              AMC Contracts
            </div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 text-center border border-gray-100">
            <div className="text-3xl font-bold text-orange-500 mb-1">
              {service._count?.complaints || 0}
            </div>
            <div className="text-xs font-medium text-gray-500">Complaints</div>
          </div>
        </div>

        <button
          type="button"
          className="w-full rounded-xl bg-gray-50 px-3 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
