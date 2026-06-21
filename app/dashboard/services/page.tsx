import { prisma } from "@/lib/db";
import {
  Plus,
  Search,
  Wrench,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { ServicesTable, type ServiceWithCustomer } from "@/components/dashboard/services/services-table";
import { SearchInput } from "@/components/ui/search-input";
import { FilterDialog, FilterCategory } from "@/components/ui/filter-dialog";
import { Prisma } from "@/generated/prisma/client";
import { unstable_cache } from "next/cache";

interface ServicesCacheParams {
  query?: string;
  sort?: string;
  typeFilter?: string;
  statusFilter?: string;
}

const getCachedServices = unstable_cache(
  async (params: ServicesCacheParams) => {
    const { query, sort, typeFilter, statusFilter } = params;

    const where: Prisma.ServiceWhereInput = { AND: [] };

    if (query) {
      (where.AND as Prisma.ServiceWhereInput[]).push({
        OR: [
          { serviceType: { contains: query, mode: "insensitive" } },
          { customer: { name: { contains: query, mode: "insensitive" } } },
        ],
      });
    }
    if (typeFilter) {
      (where.AND as Prisma.ServiceWhereInput[]).push({
        serviceType: { contains: typeFilter, mode: "insensitive" },
      });
    }
    if (statusFilter === "active") {
      (where.AND as Prisma.ServiceWhereInput[]).push({
        amcContracts: { some: { status: "ACTIVE" } },
      });
    } else if (statusFilter === "inactive") {
      (where.AND as Prisma.ServiceWhereInput[]).push({
        amcContracts: { none: { status: "ACTIVE" } },
      });
    }

    let orderBy: Prisma.ServiceOrderByWithRelationInput = {
      id: "desc",
    };
    if (sort === "date_asc") orderBy = { id: "asc" };
    if (sort === "date_desc") orderBy = { id: "desc" };

    return await prisma.service.findMany({
      where,
      include: {
        customer: true,
        technician: true,
        _count: { select: { amcContracts: true, complaints: true } },
      },
      orderBy,
    });
  },
  ["services-list-data"],
  { tags: ["services"] }
);

export default async function ServicesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    sort?: string;
    type?: string;
    status?: string;
  }>;
}) {
  const query = (await searchParams)?.query || "";
  const sort = (await searchParams)?.sort || "date_desc";
  const typeFilter = (await searchParams)?.type || "";
  const statusFilter = (await searchParams)?.status || "";

  const services = await getCachedServices({
    query,
    sort,
    typeFilter,
    statusFilter,
  });

  const serviceFilters: FilterCategory[] = [
    {
      id: "sort",
      label: "Sort By",
      type: "radio",
      options: [
        { label: "Newest Service", value: "date_desc" },
        { label: "Oldest Service", value: "date_asc" },
      ],
    },
    {
      id: "status",
      label: "Status",
      type: "radio",
      options: [
        { label: "All", value: "" },
        { label: "Active (Has Active AMC)", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      id: "type",
      label: "Service Type",
      type: "text",
      placeholder: "e.g. Split AC, Model X...",
    },
  ];

  const activeCount = services.filter((s) => s._count.amcContracts > 0).length;
  const inactiveCount = services.length - activeCount;


  return (
    <div
      className="relative min-h-screen max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
      style={{ fontFamily: "'DM Sans', 'Sora', sans-serif" }}
    >
      {/* ── Background Elements for Glassmorphism Context ────────── */}
      <div className="fixed inset-0 z-[-1] bg-slate-50 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-300/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-[120px] opacity-60" />
      </div>

      {/* ── Hero Header ────────────────────────────────────────── */}
      <div className="relative mb-8 rounded-3xl overflow-hidden border border-white/20 shadow-2xl backdrop-blur-xl">
        {/* Gradient background with glass transparency */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "linear-gradient(135deg, rgba(30,42,94,0.85) 0%, rgba(46,52,88,0.85) 40%, rgba(59,74,138,0.85) 70%, rgba(79,95,168,0.85) 100%)",
          }}
        />
        {/* Dot-grid texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative px-8 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Icon badge - Glassmorphic */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              <Wrench className="h-8 w-8 text-blue-100" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-200 mb-1">
                Service Management
              </p>
              <h1
                className="text-4xl font-bold text-white leading-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                Services
              </h1>
              <p className="mt-1 text-sm text-blue-100/80">
                {services.length} installations &mdash; manage customer service
                records
              </p>
            </div>
          </div>

          {/* Add Service Button - Genie Effect */}
          <Link
            href="/dashboard/services/new"
            className="group relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl bg-white/95 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-[#2e3458] shadow-[0_4px_20px_rgba(255,255,255,0.1)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-105 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.3)] active:scale-95"
          >
            {/* Sweeping Shine Effect */}
            <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-blue-100/60 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-[150%]" />
            <Plus className="relative z-10 h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:rotate-180" />
            <span className="relative z-10">Add Service</span>
          </Link>
        </div>
      </div>

      {/* ── Stat Cards (Glassmorphic) ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Total */}
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl px-6 py-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform hover:-translate-y-1 duration-300">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-slate-200/20 -translate-y-10 translate-x-10 blur-xl" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 shadow-sm border border-white/40">
              <Activity className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Services
              </p>
              <p
                className="text-3xl font-bold text-slate-800"
                style={{ letterSpacing: "-0.03em" }}
              >
                {services.length}
              </p>
            </div>
          </div>
        </div>

        {/* Active AMC */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-emerald-50/40 backdrop-blur-xl px-6 py-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform hover:-translate-y-1 duration-300">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-200/30 -translate-y-10 translate-x-10 blur-xl" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/60 shadow-sm border border-emerald-200/40">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Active AMC
              </p>
              <p
                className="text-3xl font-bold text-emerald-800"
                style={{ letterSpacing: "-0.03em" }}
              >
                {activeCount}
              </p>
            </div>
          </div>
        </div>

        {/* Inactive */}
        <div className="relative overflow-hidden rounded-3xl border border-orange-100/60 bg-orange-50/40 backdrop-blur-xl px-6 py-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform hover:-translate-y-1 duration-300">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-orange-200/30 -translate-y-10 translate-x-10 blur-xl" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100/60 shadow-sm border border-orange-200/40">
              <XCircle className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                Inactive
              </p>
              <p
                className="text-3xl font-bold text-orange-800"
                style={{ letterSpacing: "-0.03em" }}
              >
                {inactiveCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center z-10">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <div className="[&_input]:pl-11 [&_input]:rounded-2xl [&_input]:border-white/60 [&_input]:bg-white/50 [&_input]:backdrop-blur-md [&_input]:text-sm [&_input]:shadow-sm [&_input]:ring-1 [&_input]:ring-black/5 [&_input:focus]:ring-2 [&_input:focus]:ring-blue-500/40 [&_input:focus]:bg-white/80 [&_input:focus]:outline-none [&_input]:transition-all [&_input]:duration-300">
            <SearchInput placeholder="Search by type or customer name…" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Assuming FilterDialog wraps a button, you may want to apply glass classes to its trigger inside that component as well */}
          <FilterDialog filters={serviceFilters} />
        </div>
      </div>

      {/* ── Services Grid ─────────────────────────────────────────── */}
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl py-32 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="h-24 w-24 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-white/80 bg-white/50 backdrop-blur-sm">
            <Wrench className="h-10 w-10 text-indigo-400" />
          </div>
          <p className="text-slate-700 text-base font-semibold mb-2">
            No services found
          </p>
          <p className="text-slate-500 text-sm mb-8 text-center max-w-xs">
            Try adjusting your filters or start by adding a new service
            installation.
          </p>

          {/* Empty State Button - Genie Effect */}
          <Link
            href="/dashboard/services/new"
            className="group relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-[#2e3458] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-105 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(46,52,88,0.4)] active:scale-95"
          >
            {/* Sweeping Shine Effect */}
            <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-[150%]" />
            <Plus className="relative z-10 h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:rotate-180" />
            <span className="relative z-10">Add your first service</span>
          </Link>
        </div>
      ) : (
        <ServicesTable services={services as ServiceWithCustomer[]} />
      )}
    </div>
  );
}
