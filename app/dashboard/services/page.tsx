import { prisma } from "@/lib/db";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ServicesGrid } from "@/components/dashboard/services/services-grid";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    include: {
      customer: true,
      _count: {
        select: {
          amcContracts: true,
          complaints: true,
        },
      },
    },
    orderBy: {
      installationDate: "desc",
    },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Services
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer service installations.
          </p>
        </div>
        <Link
          href="/dashboard/services/new"
          className="inline-flex items-center justify-center rounded-xl bg-[#2e3458] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-[#232846] transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Link>
      </div>

      <ServicesGrid services={services} />
    </div>
  );
}
