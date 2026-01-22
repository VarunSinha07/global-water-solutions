import { prisma } from "@/lib/db";
import {
  Plus,
  Check,
  Clock,
  XCircle,
  Filter,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: {
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
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

  return (
    <div className="space-y-8">
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
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No transactions found
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
