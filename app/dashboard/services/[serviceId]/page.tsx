import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  ShieldCheck,
  Settings,
  MapPin,
  Download,
  Edit2,
  Clock,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { EditServiceForm } from "./components/edit-form";

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      customer: true,
      technician: true,
      amcContracts: true,
    },
  });

  if (!service) return notFound();

  const isCompleted = service.status === "COMPLETED";

  return (
    <div
      className="relative min-h-screen max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
      style={{ fontFamily: "'DM Sans', 'Sora', sans-serif" }}
    >
      {/* ── Ambient Background ──────────────────────────────────── */}
      <div className="fixed inset-0 z-[-1] bg-slate-50 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-60" />
        <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] bg-indigo-200/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-50" />
      </div>

      {/* ── Top Navigation / Breadcrumb ─────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/services"
          className="group inline-flex items-center text-sm font-medium text-slate-500 hover:text-[#2e3458] transition-colors bg-white/40 hover:bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200/60 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Services
        </Link>
      </div>

      {/* ── Hero Banner / Service Identity ──────────────────────── */}
      <div className="relative mb-8 rounded-3xl overflow-hidden border border-white/60 shadow-lg backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/50">
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />

        <div className="relative p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${
                  service.status === "COMPLETED"
                    ? "bg-emerald-100/80 text-emerald-700 border-emerald-200"
                    : service.status === "IN_PROGRESS"
                      ? "bg-amber-100/80 text-amber-700 border-amber-200"
                      : service.status === "CANCELLED"
                        ? "bg-slate-100/80 text-slate-700 border-slate-200"
                        : "bg-red-100/80 text-red-700 border-red-200"
                }`}
              >
                {service.status !== "COMPLETED" &&
                  service.status !== "CANCELLED" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  )}
                {service.status.replace("_", " ")}
              </span>
              <span className="text-sm font-medium text-slate-400">
                Created{" "}
                {new Date(service.serviceRegisterDate).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "short", day: "numeric" },
                )}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
              Service Overview
            </h1>
            <div className="flex items-center gap-2 text-slate-500">
              <FileText className="w-4 h-4" />
              <p className="font-mono text-sm font-medium bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/50">
                ID:{" "}
                {service.serviceNumber ||
                  service.id.split("-")[0].toUpperCase()}
              </p>
            </div>
          </div>

          {/* Quick Stats Highlight */}
          <div className="flex gap-4 sm:gap-8 border-t md:border-t-0 md:border-l border-slate-200/60 pt-6 md:pt-0 md:pl-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Service Type
              </p>
              <p className="text-lg font-bold text-slate-700">
                {service.serviceType}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Technician
              </p>
              <p className="text-lg font-bold text-[#2e3458]">
                {service.technician?.name || "Unassigned"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Details Card */}
        <div className="rounded-3xl border border-white/60 bg-white/50 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:bg-white/70">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100/60 text-blue-600 border border-blue-200/40">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Customer Details
            </h2>
          </div>
          <div className="space-y-4">
            <Link
              href={`/dashboard/customers/${service.customerId}`}
              className="block p-3 -mx-3 -mt-3 rounded-xl hover:bg-slate-100/50 transition-colors border border-transparent hover:border-slate-200/40"
            >
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Name
              </p>
              <p className="text-sm font-bold text-blue-600 hover:underline">
                {service.customer.name}
              </p>
            </Link>
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Contact
                </p>
              </div>
              <p className="text-sm font-medium text-slate-700">
                {service.customer.phone}
              </p>
              {service.customer.email && (
                <p className="text-sm text-slate-500 mt-1">
                  {service.customer.email}
                </p>
              )}
            </div>
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Location
                </p>
              </div>
              <p className="text-sm font-medium text-slate-700">
                {service.customer.address}
              </p>
            </div>
          </div>
        </div>

        {/* Edit / Management Form (Takes Up 2 Columns) */}
        <div className="lg:col-span-2 rounded-3xl border border-white/60 bg-white/50 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:bg-white/70">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100/60 text-indigo-600 border border-indigo-200/40">
              <Edit2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Manage Service
              </h2>
              <p className="text-sm text-slate-500">
                Update payment and completion statuses
              </p>
            </div>
          </div>

          <EditServiceForm service={service} />
        </div>
      </div>
    </div>
  );
}
