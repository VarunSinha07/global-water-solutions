import { prisma } from "@/lib/db";
import { Plus, Check, Clock, XCircle, Download, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SearchInput } from "@/components/ui/search-input";
import { FilterDialog, FilterCategory } from "@/components/ui/filter-dialog";
import type { Prisma } from "@/generated/prisma/client";
import { unstable_cache } from "next/cache";

interface PaymentsCacheParams {
  query?: string;
  statusParam?: string;
  modeParam?: string;
  dateStart?: string;
  dateEnd?: string;
  amountMin?: number;
  amountMax?: number;
}

const getCachedPayments = unstable_cache(
  async (params: PaymentsCacheParams) => {
    const {
      query,
      statusParam,
      modeParam,
      dateStart,
      dateEnd,
      amountMin,
      amountMax,
    } = params;

    const andConditions: Prisma.PaymentWhereInput[] = [
      query
        ? {
            customer: { name: { contains: query, mode: "insensitive" } },
          }
        : {},
    ];

    if (statusParam) {
      andConditions.push({
        status: statusParam as "PAID" | "PENDING" | "FAILED",
      });
    }

    if (modeParam) {
      andConditions.push({
        paymentMode: { contains: modeParam, mode: "insensitive" },
      });
    }

    if (dateStart || dateEnd) {
      andConditions.push({
        paymentDate: {
          gte: dateStart ? new Date(dateStart) : undefined,
          lte: dateEnd ? new Date(dateEnd) : undefined,
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

    return await prisma.payment.findMany({
      where: {
        AND: andConditions,
      },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
  ["payments-list-data"],
  { tags: ["payments"] }
);

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    status?: string;
    mode?: string;
    dateStart?: string;
    dateEnd?: string;
    amountMin?: string;
    amountMax?: string;
  }>;
}) {
  const query = (await searchParams)?.query || "";
  const statusParam = (await searchParams)?.status || "";
  const modeParam = (await searchParams)?.mode || "";

  const dateStartString = (await searchParams)?.dateStart;
  const dateEndString = (await searchParams)?.dateEnd;
  const amountMinString = (await searchParams)?.amountMin;
  const amountMin = amountMinString ? parseFloat(amountMinString) : undefined;
  const amountMaxString = (await searchParams)?.amountMax;
  const amountMax = amountMaxString ? parseFloat(amountMaxString) : undefined;

  const payments = await getCachedPayments({
    query,
    statusParam,
    modeParam,
    dateStart: dateStartString,
    dateEnd: dateEndString,
    amountMin,
    amountMax,
  });

  const totalCollected = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);

  const failedAmount = payments
    .filter((p) => p.status === "FAILED")
    .reduce((sum, p) => sum + p.amount, 0);

  const paymentFilters: FilterCategory[] = [
    {
      id: "status",
      label: "Status",
      type: "radio",
      options: [
        { label: "All", value: "" },
        { label: "Paid", value: "PAID" },
        { label: "Pending", value: "PENDING" },
        { label: "Failed", value: "FAILED" },
      ],
    },
    {
      id: "mode",
      label: "Payment Method",
      type: "radio",
      options: [
        { label: "Any", value: "" },
        { label: "Cash", value: "CASH" },
        { label: "UPI", value: "UPI" },
        { label: "Bank Transfer", value: "BANK_TRANSFER" },
        { label: "Cheque", value: "CHEQUE" },
      ],
    },
    {
      id: "date",
      label: "Payment Date",
      type: "date-range",
    },
    {
      id: "amount",
      label: "Amount",
      type: "range",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Payments
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Track transactions and financial records.
          </p>
        </div>
        <Link
          href="/dashboard/payments/new"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
        <div className="w-full sm:max-w-xs">
          <SearchInput placeholder="Search by customer..." />
        </div>
        <FilterDialog filters={paymentFilters} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/50 flex items-center gap-4">
          <div className="rounded-full bg-green-50 p-3 text-green-600">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{totalCollected.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/50 flex items-center gap-4">
          <div className="rounded-full bg-orange-50 p-3 text-orange-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{pendingAmount.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/50 flex items-center gap-4">
          <div className="rounded-full bg-red-50 p-3 text-red-600">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Failed</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{failedAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/50 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              All
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="rounded-full bg-gray-50 p-4 border border-gray-100">
                        <Filter className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        No transactions found
                      </p>
                      <p className="text-sm text-gray-500">
                        There are no payment records matching your current
                        filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="group hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 font-mono">
                      {payment.id.split("-")[0].toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.customer.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleDateString(
                            "en-GB",
                          )
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 uppercase text-xs font-semibold">
                      {payment.paymentMode}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset uppercase",
                          payment.status === "PAID"
                            ? "bg-green-50 text-green-700 ring-green-600/20"
                            : payment.status === "PENDING"
                              ? "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                              : "bg-red-50 text-red-700 ring-red-600/10",
                        )}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      ₹{payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/payments/${payment.id}`}
                        className="text-indigo-600 hover:text-indigo-900 font-medium text-xs"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
