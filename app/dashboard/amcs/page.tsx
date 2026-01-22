import { prisma } from "@/lib/db";
import { Plus, Calendar, RotateCw, FileText } from "lucide-react";
import Link from "next/link";
import { AMCsGrid } from "@/components/dashboard/amcs/amcs-grid";

export default async function AMCContractsPage() {
  const amcs = await prisma.aMCContract.findMany({
    include: {
      customer: true,
      service: true,
      payments: true,
    },
    orderBy: {
      endDate: "asc",
    },
  });

  const now = new Date();
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

      {/* Stats Row */}
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
