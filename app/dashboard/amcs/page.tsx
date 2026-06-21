import { prisma } from "@/lib/db";
import { Plus, Calendar, RotateCw, FileText } from "lucide-react";
import Link from "next/link";
import { AMCsGrid } from "@/components/dashboard/amcs/amcs-grid";
import { SearchInput } from "@/components/ui/search-input";
import { FilterDialog, FilterCategory } from "@/components/ui/filter-dialog";
import { addDays } from "date-fns";
import { AMCStatus, type Prisma } from "@/generated/prisma/client";
import { unstable_cache } from "next/cache";

interface AMCsCacheParams {
  query?: string;
  statusParam?: string;
  startDateStart?: string;
  startDateEnd?: string;
  endDateStart?: string;
  endDateEnd?: string;
  amountMin?: number;
  amountMax?: number;
  modelQuery?: string;
}

const getCachedAMCs = unstable_cache(
  async (params: AMCsCacheParams) => {
    const {
      query,
      statusParam,
      startDateStart,
      startDateEnd,
      endDateStart,
      endDateEnd,
      amountMin,
      amountMax,
      modelQuery,
    } = params;

    const whereClause: Prisma.AMCContractWhereInput = {};
    const andConditions: Prisma.AMCContractWhereInput[] = [];

    if (query) {
      andConditions.push({
        customer: {
          name: { contains: query, mode: "insensitive" as const },
        },
      });
    }

    if (statusParam === "expiring_soon") {
      const today = new Date();
      const thirtyDaysLater = addDays(today, 30);
      andConditions.push({
        status: "ACTIVE",
        endDate: {
          gte: today,
          lte: thirtyDaysLater,
        },
      });
    } else if (statusParam) {
      andConditions.push({ status: statusParam as AMCStatus });
    }

    if (startDateStart || startDateEnd) {
      andConditions.push({
        startDate: {
          gte: startDateStart ? new Date(startDateStart) : undefined,
          lte: startDateEnd ? new Date(startDateEnd) : undefined,
        },
      });
    }
    if (endDateStart || endDateEnd) {
      andConditions.push({
        endDate: {
          gte: endDateStart ? new Date(endDateStart) : undefined,
          lte: endDateEnd ? new Date(endDateEnd) : undefined,
        },
      });
    }

    if (amountMin !== undefined || amountMax !== undefined) {
      andConditions.push({
        amount: {
          gte: amountMin,
          lte: amountMax,
        },
      });
    }

    if (modelQuery) {
      andConditions.push({
        service: {
          serviceType: { contains: modelQuery, mode: "insensitive" },
        },
      });
    }

    if (andConditions.length > 0) {
      whereClause.AND = andConditions;
    }

    return await prisma.aMCContract.findMany({
      where: whereClause,
      include: {
        customer: true,
        service: true,
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
  ["amcs-list-data"],
  { tags: ["amcs"] }
);

export default async function AMCContractsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    status?: string;
    startDateStart?: string;
    startDateEnd?: string;
    endDateStart?: string;
    endDateEnd?: string;
    amountMin?: string;
    amountMax?: string;
    model?: string;
  }>;
}) {
  const query = (await searchParams)?.query || "";
  const statusParam = (await searchParams)?.status || "";

  // Date Filters
  const startDateStartString = (await searchParams)?.startDateStart;
  const startDateEndString = (await searchParams)?.startDateEnd;
  const endDateStartString = (await searchParams)?.endDateStart;
  const endDateEndString = (await searchParams)?.endDateEnd;

  // Amount Filters
  const amountMinString = (await searchParams)?.amountMin;
  const amountMin = amountMinString ? parseFloat(amountMinString) : undefined;
  const amountMaxString = (await searchParams)?.amountMax;
  const amountMax = amountMaxString ? parseFloat(amountMaxString) : undefined;

  // Model Filter
  const modelQuery = (await searchParams)?.model || "";

  const amcs = await getCachedAMCs({
    query,
    statusParam,
    startDateStart: startDateStartString,
    startDateEnd: startDateEndString,
    endDateStart: endDateStartString,
    endDateEnd: endDateEndString,
    amountMin,
    amountMax,
    modelQuery,
  });

  const amcFilters: FilterCategory[] = [
    {
      id: "status",
      label: "Status",
      type: "radio",
      options: [
        { label: "All", value: "" },
        { label: "Active", value: "ACTIVE" },
        { label: "Expired", value: "EXPIRED" },
        { label: "Pending Payment", value: "PENDING_PAYMENT" },
        { label: "Expiring Soon (30 Days)", value: "expiring_soon" },
      ],
    },
    {
      id: "startDate",
      label: "Start Date",
      type: "date-range",
    },
    {
      id: "endDate",
      label: "End Date",
      type: "date-range",
    },
    {
      id: "amount",
      label: "Amount",
      type: "range",
    },
    {
      id: "model",
      label: "Model / Capacity",
      type: "text",
      placeholder: "Search Model or Capacity...",
    },
  ];

  const now = new Date();

  // Stats based on currently filtered view
  const activeCount = amcs.filter(
    (a) => a.status === "ACTIVE" && new Date(a.endDate) > now,
  ).length;

  const expiringSoonCount = amcs.filter((a) => {
    const endDate = new Date(a.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30 && a.status === "ACTIVE";
  }).length;

  const expiredCount = amcs.filter(
    (a) => a.status === "EXPIRED" || new Date(a.endDate) < now,
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            AMC Contracts
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage annual maintenance contracts and renewals.
          </p>
        </div>
        <Link
          href="/dashboard/amcs/new"
          className="inline-flex items-center justify-center rounded-xl bg-[#312e81] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#23215e] transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Contract
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
        <div className="relative w-full max-w-md">
          <SearchInput placeholder="Search by customer..." />
        </div>
        <FilterDialog filters={amcFilters} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/50 flex items-center gap-4">
          <div className="rounded-full bg-green-50 p-3 text-green-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Active Contracts
            </p>
            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/50 flex items-center gap-4">
          <div className="rounded-full bg-orange-50 p-3 text-orange-600">
            <RotateCw className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
            <p className="text-2xl font-bold text-gray-900">
              {expiringSoonCount}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/50 flex items-center gap-4">
          <div className="rounded-full bg-red-50 p-3 text-red-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Expired</p>
            <p className="text-2xl font-bold text-gray-900">{expiredCount}</p>
          </div>
        </div>
      </div>

      <AMCsGrid amcs={amcs} referenceDate={now} />
    </div>
  );
}
