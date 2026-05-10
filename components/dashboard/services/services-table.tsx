"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Prisma } from "@/generated/prisma/client";

// Infer type from Prisma includes
type ServiceWithCustomer = Prisma.ServiceGetPayload<{
  include: {
    customer: true;
    technician: true;
  };
}>;

interface ServicesTableProps {
  services: ServiceWithCustomer[];
}

export function ServicesTable({ services }: ServicesTableProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-slate-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Recent Services
        </h2>
        <Link
          href="/dashboard/services"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm transition-all hover:bg-slate-50"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 font-semibold">SERVICE ID</th>
              <th className="px-6 py-4 font-semibold">CUSTOMER</th>
              <th className="px-6 py-4 font-semibold">SERVICE TYPE</th>
              <th className="px-6 py-4 font-semibold">TECHNICIAN</th>
              <th className="px-6 py-4 font-semibold">DATE</th>
              <th className="px-6 py-4 font-semibold">STATUS</th>
              <th className="px-6 py-4 font-semibold text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y border-slate-100">
            {services.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No services found.
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr
                  key={service.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    {service.serviceNumber ||
                      service.id.split("-")[0].toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/customers/${service.customerId}`}
                      className="group flex flex-col items-start hover:bg-slate-100/50 p-2 -ml-2 rounded-lg transition-colors"
                      title="View Customer Profile"
                    >
                      <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {service.customer.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 font-mono">
                        {service.customer.phone}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-1 max-w-[200px]">
                        {service.customer.address}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">
                    {service.serviceType}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">
                    {service.technician?.name || (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">
                    {new Date(service.serviceRegisterDate).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      },
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      let bgColor = "bg-slate-100";
                      let textColor = "text-slate-700";
                      let text: string = service.status;

                      if (service.status === "COMPLETED") {
                        bgColor = "bg-emerald-100";
                        textColor = "text-emerald-700";
                        text = "Completed";
                      } else if (service.status === "IN_PROGRESS") {
                        bgColor = "bg-amber-100";
                        textColor = "text-amber-700";
                        text = "In Progress";
                      } else if (service.status === "PENDING") {
                        bgColor = "bg-red-100";
                        textColor = "text-red-700";
                        text = "Pending";
                      } else if (service.status === "CANCELLED") {
                        bgColor = "bg-slate-200";
                        textColor = "text-slate-600";
                        text = "Cancelled";
                      }

                      return (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor}`}
                        >
                          {text}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <Link
                        href={`/dashboard/services/${service.id}`}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
