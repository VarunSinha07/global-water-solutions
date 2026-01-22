import { prisma } from "@/lib/db";
import { Plus, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function ComplaintsPage() {
  const complaints = await prisma.complaint.findMany({
    include: {
      customer: true,
      service: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const openCount = complaints.filter((c) => c.status === "OPEN").length;
  const progressCount = complaints.filter(
    (c) => c.status === "IN_PROGRESS",
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "RESOLVED",
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Complaints & Service
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer complaints and service requests.
          </p>
        </div>
        <Link
          href="/dashboard/complaints/new"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/50 flex items-center gap-4">
          <div className="rounded-full bg-red-50 p-3 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Open</p>
            <p className="text-2xl font-bold text-gray-900">{openCount}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/50 flex items-center gap-4">
          <div className="rounded-full bg-orange-50 p-3 text-orange-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-gray-900">{progressCount}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/50 flex items-center gap-4">
          <div className="rounded-full bg-green-50 p-3 text-green-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Resolved</p>
            <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {complaints.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No active complaints.
          </div>
        ) : (
          complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/50 transition-all hover:shadow-md"
            >
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {complaint.service.serviceType}
                  </h3>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset uppercase",
                      complaint.status === "OPEN"
                        ? "bg-red-50 text-red-700 ring-red-600/10"
                        : complaint.status === "IN_PROGRESS"
                          ? "bg-orange-50 text-orange-700 ring-orange-600/20"
                          : "bg-green-50 text-green-700 ring-green-600/20",
                    )}
                  >
                    {complaint.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  {complaint.customer.name} • ID: {complaint.id.split("-")[0]}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {complaint.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Assigned:{" "}
                    <span className="text-gray-900 font-medium">
                      Unassigned
                    </span>
                  </span>
                  <span>
                    {new Date(complaint.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 flex gap-3">
                <Link
                  href={`/dashboard/complaints/${complaint.id}`}
                  className="flex-1 flex items-center justify-center rounded-lg bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  View Details
                </Link>
                {complaint.status !== "RESOLVED" && (
                  <button className="flex-1 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-green-500 transition-colors">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
