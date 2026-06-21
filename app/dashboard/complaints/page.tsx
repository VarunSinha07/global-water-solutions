import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { Plus, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SearchInput } from "@/components/ui/search-input";
import { FilterDialog, FilterCategory } from "@/components/ui/filter-dialog";
import { ComplaintStatus } from "@/generated/prisma/client";
import { unstable_cache } from "next/cache";

interface ComplaintsCacheParams {
  query?: string;
  statusParam?: string;
  startDateStart?: string;
  startDateEnd?: string;
}

const getCachedComplaints = unstable_cache(
  async (params: ComplaintsCacheParams) => {
    const { query, statusParam, startDateStart, startDateEnd } = params;

    const whereClause: Prisma.ComplaintWhereInput = {
      AND: [
        query
          ? {
              OR: [
                {
                  customer: { name: { contains: query, mode: "insensitive" } },
                },
                { description: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    };

    if (statusParam) {
      (whereClause.AND as Prisma.ComplaintWhereInput[]).push({
        status: statusParam as ComplaintStatus,
      });
    }

    if (startDateStart || startDateEnd) {
      (whereClause.AND as Prisma.ComplaintWhereInput[]).push({
        createdAt: {
          gte: startDateStart ? new Date(startDateStart) : undefined,
          lte: startDateEnd ? new Date(startDateEnd) : undefined,
        },
      });
    }

    return await prisma.complaint.findMany({
      where: whereClause,
      include: {
        customer: true,
        service: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
  ["complaints-list-data"],
  { tags: ["complaints"] }
);

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    status?: string;
    startDateStart?: string;
    startDateEnd?: string;
  }>;
}) {
  const query = (await searchParams)?.query || "";
  const statusParam = (await searchParams)?.status || "";

  const startDateStartString = (await searchParams)?.startDateStart;
  const startDateEndString = (await searchParams)?.startDateEnd;

  const complaints = await getCachedComplaints({
    query,
    statusParam,
    startDateStart: startDateStartString,
    startDateEnd: startDateEndString,
  });

  const openCount = complaints.filter((c) => c.status === "OPEN").length;
  const progressCount = complaints.filter(
    (c) => c.status === "IN_PROGRESS",
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "RESOLVED",
  ).length;

  const complaintFilters: FilterCategory[] = [
    {
      id: "status",
      label: "Status",
      type: "radio",
      options: [
        { label: "All", value: "" },
        { label: "Open", value: "OPEN" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Resolved", value: "RESOLVED" },
      ],
    },
    {
      id: "startDate",
      label: "Created Date",
      type: "date-range",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
        <div className="w-full sm:max-w-xs">
          <SearchInput placeholder="Search complaints..." />
        </div>
        <FilterDialog filters={complaintFilters} />
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
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/50 backdrop-blur-sm py-16 px-4 text-center shadow-sm transition-all hover:bg-white">
            <div className="mx-auto mb-4 rounded-full bg-gray-50 p-4 border border-gray-100">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-base font-semibold text-gray-900">
              No complaints found
            </h3>
            <p className="max-w-sm text-sm text-gray-500">
              There are currently no active complaints matching your search
              criteria.
            </p>
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
