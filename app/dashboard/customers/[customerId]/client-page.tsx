"use client";

import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Mail,
  Wrench,
  FileText,
  Plus,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Trash2,
  Loader2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { deleteCustomer } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Types matching the Prisma output
type CustomerDetail = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string | null;
  createdAt: Date;
  plantCategory?: string | null;
  plantCost?: number | null;
  paymentMode?: string | null;
  emi?: number | null;
  paymentStatus?: string | null;
  services: {
    id: string;
    serviceType: string;
    serviceRegisterDate: Date | string;
    amcContracts: {
      id: string;
      startDate: Date | string;
      endDate: Date | string;
      amount: number;
      status: string;
    }[];
  }[];
  payments: {
    id: string;
    amount: number;
    createdAt: Date | string;
    paymentMode: string;
    status: string;
    amcId?: string;
  }[];
  complaints: {
    id: string;
    description: string;
    status: string;
    createdAt: Date | string;
    technician?: {
      name: string;
    } | null;
  }[];
};

export default function ClientPage({ customer }: { customer: CustomerDetail }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "services" | "payments" | "complaints"
  >("services");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirmName !== customer.name) {
      toast.error("Customer name does not match.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await deleteCustomer(customer.id);
        if (result && "error" in result) {
          toast.error(result.error);
        } else {
          toast.success("Customer deleted successfully.");
          setShowDeleteModal(false);
          router.push("/dashboard/customers");
        }
      } catch (error) {
        toast.error("An unexpected error occurred.");
        console.error(error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/customers"
            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500 transition-colors group-hover:text-gray-900" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              {customer.name}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span className="flex items-center">
                <User className="mr-1 h-3.5 w-3.5" /> Customer ID:{" "}
                {customer.id.substring(0, 8)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.98]">
            Edit Profile
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-all hover:bg-red-100 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 active:scale-[0.98]"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Customer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Customer Profile */}
        <div className="space-y-6">
          <div className="group rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <User className="h-4 w-4" />
                </div>
                Contact Details
              </h3>
            </div>
            <div className="space-y-5 text-sm">
              <div className="flex items-start group/item">
                <div className="mt-0.5 mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-500 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Phone</p>
                  <p className="text-gray-500 font-mono mt-0.5">
                    {customer.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-start group/item">
                <div className="mt-0.5 mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-500 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-gray-500 mt-0.5 break-all">
                    {customer.email || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start group/item">
                <div className="mt-0.5 mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-500 transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Address</p>
                  <p className="text-gray-500 mt-0.5">{customer.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Wrench className="h-4 w-4" />
                </div>
                Plant & Financials
              </h3>
            </div>
            <div className="space-y-5 text-sm">
              <div className="flex items-start group/item">
                <div className="mt-0.5 flex-1">
                  <p className="font-medium text-gray-900 text-xs uppercase tracking-wider text-gray-400">
                    Category
                  </p>
                  <p className="text-gray-900 mt-1 font-medium capitalize">
                    {customer.plantCategory?.replace("_", " ").toLowerCase() ||
                      "N/A"}
                  </p>
                </div>
                <div className="mt-0.5 flex-1">
                  <p className="font-medium text-gray-900 text-xs uppercase tracking-wider text-gray-400">
                    Cost
                  </p>
                  <p className="text-gray-900 mt-1 font-medium">
                    {customer.plantCost != null
                      ? `Rs. ${customer.plantCost.toLocaleString()}`
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start group/item">
                <div className="mt-0.5 flex-1">
                  <p className="font-medium text-gray-900 text-xs uppercase tracking-wider text-gray-400">
                    Payment Mode
                  </p>
                  <p className="text-gray-900 mt-1 font-medium">
                    {customer.paymentMode || "N/A"}
                  </p>
                </div>
                <div className="mt-0.5 flex-1">
                  <p className="font-medium text-gray-900 text-xs uppercase tracking-wider text-gray-400">
                    EMI / Iterations
                  </p>
                  <p className="text-gray-900 mt-1 font-medium">
                    {customer.emi ? `${customer.emi} Installment(s)` : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start group/item pt-3 border-t border-gray-100">
                <div className="mt-0.5 flex-1 flex items-center justify-between w-full">
                  <p className="font-medium text-gray-900 text-xs uppercase tracking-wider text-gray-400">
                    Status
                  </p>
                  <span
                    className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-full",
                      customer.paymentStatus === "PAID"
                        ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                        : customer.paymentStatus === "UNPAID"
                          ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                          : "bg-gray-50 text-gray-600 ring-1 ring-gray-500/20",
                    )}
                  >
                    {customer.paymentStatus || "UNKNOWN"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                Quick Actions
              </h3>
            </div>
            <div className="space-y-2">
              <Link
                href={`/dashboard/services/new?customerId=${customer.id}`}
                className="group w-full flex items-center justify-between px-4 py-3 rounded-xl border border-transparent bg-gray-50 text-sm font-medium text-gray-700 hover:bg-white hover:border-indigo-100 hover:shadow-sm hover:text-indigo-700 transition-all"
              >
                <span className="flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm border border-gray-100 group-hover:border-indigo-100 group-hover:bg-indigo-50">
                    <Plus className="h-4 w-4" />
                  </div>
                  Add Service
                </span>
              </Link>
              <Link
                href={`/dashboard/amcs/new?customerId=${customer.id}`}
                className="group w-full flex items-center justify-between px-4 py-3 rounded-xl border border-transparent bg-gray-50 text-sm font-medium text-gray-700 hover:bg-white hover:border-green-100 hover:shadow-sm hover:text-green-700 transition-all"
              >
                <span className="flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-green-600 shadow-sm border border-gray-100 group-hover:border-green-100 group-hover:bg-green-50">
                    <FileText className="h-4 w-4" />
                  </div>
                  Create AMC
                </span>
              </Link>
              <Link
                href={`/dashboard/complaints/new?customerId=${customer.id}`}
                className="group w-full flex items-center justify-between px-4 py-3 rounded-xl border border-transparent bg-gray-50 text-sm font-medium text-gray-700 hover:bg-white hover:border-red-100 hover:shadow-sm hover:text-red-700 transition-all"
              >
                <span className="flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm border border-gray-100 group-hover:border-red-100 group-hover:bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  Log Complaint
                </span>
              </Link>
              <Link
                href={`/dashboard/payments/new?customerId=${customer.id}`}
                className="group w-full flex items-center justify-between px-4 py-3 rounded-xl border border-transparent bg-gray-50 text-sm font-medium text-gray-700 hover:bg-white hover:border-gray-200 hover:shadow-sm hover:text-gray-900 transition-all"
              >
                <span className="flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm border border-gray-100 group-hover:border-gray-200 group-hover:bg-gray-100">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  Record Payment
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inline Forms Removed */}

          <div className="rounded-xl border border-gray-200/60 bg-white shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <div className="border-b border-gray-100 bg-gray-50/50 px-6 pt-4">
              <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("services")}
                  className={cn(
                    activeTab === "services"
                      ? "border-indigo-500 text-indigo-600 bg-white shadow-sm border-b-0 rounded-t-lg ring-1 ring-inset ring-black/5"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-t-lg transition-all",
                    "whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2 transition-all relative top-[1px]",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Wrench
                      className={cn(
                        "h-4 w-4",
                        activeTab === "services"
                          ? "text-indigo-500"
                          : "text-gray-400",
                      )}
                    />
                    Services & AMCs
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("payments")}
                  className={cn(
                    activeTab === "payments"
                      ? "border-indigo-500 text-indigo-600 bg-white shadow-sm border-b-0 rounded-t-lg ring-1 ring-inset ring-black/5"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-t-lg transition-all",
                    "whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2 transition-all relative top-[1px]",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard
                      className={cn(
                        "h-4 w-4",
                        activeTab === "payments"
                          ? "text-indigo-500"
                          : "text-gray-400",
                      )}
                    />
                    Payments
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("complaints")}
                  className={cn(
                    activeTab === "complaints"
                      ? "border-indigo-500 text-indigo-600 bg-white shadow-sm border-b-0 rounded-t-lg ring-1 ring-inset ring-black/5"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-t-lg transition-all",
                    "whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2 transition-all relative top-[1px]",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle
                      className={cn(
                        "h-4 w-4",
                        activeTab === "complaints"
                          ? "text-indigo-500"
                          : "text-gray-400",
                      )}
                    />
                    Complaints
                  </div>
                </button>
              </nav>
            </div>

            <div className="p-6 flex-1">
              {/* SERVICES TAB */}
              {activeTab === "services" && (
                <div className="space-y-6">
                  {customer.services.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <Wrench className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-base font-medium text-gray-900">
                        No services found
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                        Get started by adding a new service installation for
                        this customer.
                      </p>
                      <Link
                        href={`/dashboard/services/new?customerId=${customer.id}`}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Plus className="mr-2 -ml-1 h-4 w-4" />
                        Add Service
                      </Link>
                    </div>
                  ) : (
                    customer.services.map((service: any) => (
                      <div
                        key={service.id}
                        className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md"
                      >
                        <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                              <Wrench className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {service.serviceType}
                              </h4>
                            </div>
                          </div>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                              service.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                                : service.status === "IN_PROGRESS"
                                  ? "bg-amber-50 text-amber-700 ring-amber-600/20"
                                  : service.status === "CANCELLED"
                                    ? "bg-slate-50 text-slate-700 ring-slate-600/20"
                                    : "bg-red-50 text-red-700 ring-red-600/10"
                            )}
                          >
                            {service.status ? service.status.replace("_", " ") : "PENDING"}
                          </span>
                        </div>

                        <div className="p-5 border-b border-gray-100 bg-white grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Timeline</p>
                            <p className="text-gray-900 flex items-center gap-1.5 mt-1"><Clock className="h-3.5 w-3.5 text-gray-400" /> Reg: {new Date(service.serviceRegisterDate).toLocaleDateString()}</p>
                            {service.serviceCompleteDate && (
                              <p className="text-gray-900 flex items-center gap-1.5 mt-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Done: {new Date(service.serviceCompleteDate).toLocaleDateString()}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Details</p>
                            <p className="text-gray-900 flex items-center gap-1.5 mt-1">
                              <User className="h-3.5 w-3.5 text-gray-400" /> {service.technician?.name || <span className="text-gray-400 italic">Unassigned</span>}
                            </p>
                            <p className="text-gray-900 flex items-center gap-1.5 mt-1">
                              <CreditCard className="h-3.5 w-3.5 text-gray-400" /> {service.paymentStatus || "UNPAID"} {service.amount ? `(₹${service.amount})` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="p-5">
                          <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Active Contracts
                          </h5>
                          {service.amcContracts.length === 0 ? (
                            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                              No active AMC contracts.
                              <Link
                                href={`/dashboard/amcs/new?customerId=${customer.id}`}
                                className="ml-2 text-indigo-600 font-medium hover:underline"
                              >
                                Create One
                              </Link>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {service.amcContracts.map((amc: any) => (
                                <div
                                  key={amc.id}
                                  className="group flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm transition-all hover:border-indigo-200 hover:shadow-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                                      <CheckCircle className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-medium text-gray-900">
                                        AMC Contract
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(
                                          amc.startDate,
                                        ).toLocaleDateString()}{" "}
                                        -{" "}
                                        {new Date(
                                          amc.endDate,
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="font-mono font-medium text-gray-700">
                                      ₹{amc.amount}
                                    </span>
                                    <span
                                      className={cn(
                                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                                        amc.status === "ACTIVE"
                                          ? "bg-green-50 text-green-700 ring-green-600/20"
                                          : amc.status === "PENDING_PAYMENT"
                                            ? "bg-yellow-50 text-yellow-800 ring-yellow-600/20"
                                            : "bg-gray-50 text-gray-600 ring-gray-500/10",
                                      )}
                                    >
                                      {amc.status.replace("_", " ")}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* PAYMENTS TAB */}
              {activeTab === "payments" && (
                <div className="space-y-4">
                  {customer.payments.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <CreditCard className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-base font-medium text-gray-900">
                        No payments found
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Record a payment to see it listed here.
                      </p>
                      <Link
                        href={`/dashboard/payments/new?customerId=${customer.id}`}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <CreditCard className="mr-2 -ml-1 h-4 w-4" />
                        Record Payment
                      </Link>
                    </div>
                  ) : (
                    customer.payments.map((payment: any) => (
                      <div
                        key={payment.id}
                        className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white hover:border-indigo-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100 group-hover:bg-green-100 transition-colors">
                            <span className="font-sans font-bold text-lg">
                              ₹
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-lg">
                              ₹{payment.amount}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center mt-0.5">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(
                                payment.createdAt,
                              ).toLocaleDateString()}{" "}
                              <span className="mx-1.5 text-gray-300">|</span>
                              Method:{" "}
                              <span className="font-medium text-gray-700 ml-1 capitalize">
                                {payment.paymentMode.toLowerCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {payment.status}
                          </span>
                          {payment.amcId && (
                            <div className="text-xs text-indigo-500 flex items-center font-medium bg-indigo-50 px-2 py-0.5 rounded-md">
                              AMC Linked
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* COMPLAINTS TAB */}
              {activeTab === "complaints" && (
                <div className="space-y-4">
                  {customer.complaints.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-base font-medium text-gray-900">
                        No complaints logged
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Everything seems to be running smoothly!
                      </p>
                      <Link
                        href={`/dashboard/complaints/new?customerId=${customer.id}`}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <AlertCircle className="mr-2 -ml-1 h-4 w-4" />
                        Log Complaint
                      </Link>
                    </div>
                  ) : (
                    customer.complaints.map((complaint: any) => (
                      <div
                        key={complaint.id}
                        className="p-5 border border-gray-200 rounded-xl bg-white hover:shadow-sm transition-all group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "mt-1 p-2 rounded-lg",
                                complaint.status === "OPEN"
                                  ? "bg-red-50 text-red-600"
                                  : complaint.status === "RESOLVED"
                                    ? "bg-green-50 text-green-600"
                                    : "bg-yellow-50 text-yellow-600",
                              )}
                            >
                              <Wrench className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 line-clamp-1 text-base">
                                {complaint.description}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                Logged on{" "}
                                {new Date(
                                  complaint.createdAt,
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                              complaint.status === "OPEN"
                                ? "bg-red-50 text-red-700 ring-red-600/10"
                                : complaint.status === "RESOLVED"
                                  ? "bg-green-50 text-green-700 ring-green-600/20"
                                  : "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
                            )}
                          >
                            {complaint.status}
                          </span>
                        </div>
                        {complaint.technician?.name && (
                          <div className="mt-4 bg-gray-50 rounded-lg p-3 flex items-center gap-3 border border-gray-100">
                            <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                              <User className="h-4 w-4" />
                            </div>
                            <div className="text-sm">
                              <p className="text-xs text-gray-500">
                                Assigned Technician
                              </p>
                              <p className="font-medium text-gray-900">
                                {complaint.technician.name}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 max-w-md w-full scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Customer</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Deleting <strong className="text-gray-900">{customer.name}</strong> will permanently remove all associated:
              </p>
              <ul className="list-disc list-inside text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <li>Service records and service cycles</li>
                <li>AMC contracts & status details</li>
                <li>Payment logs and financial transactions</li>
                <li>Open and resolved complaints</li>
              </ul>
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">
                  Type <span className="font-semibold text-gray-900 select-all">{customer.name}</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder="Enter customer name"
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all"
                  disabled={isPending}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setConfirmName("");
                  }}
                  disabled={isPending}
                  className="flex-1 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={confirmName !== customer.name || isPending}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Customer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
