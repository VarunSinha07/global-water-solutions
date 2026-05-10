import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { createService } from "../actions";

export default async function NewServicePage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, phone: true },
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/services"
          className="flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm hover:border-indigo-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Services
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-6">
          <h1 className="text-xl font-bold text-gray-900">Add New Service</h1>
          <p className="text-sm text-gray-500 mt-1">
            Register a newly created service for a customer.
          </p>
        </div>

        <form
          action={async (formData) => {
            "use server";
            await createService(formData);
          }}
          className="p-8 space-y-6"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                htmlFor="customerId"
                className="text-sm font-semibold text-gray-700"
              >
                Select Customer <span className="text-red-500">*</span>
              </label>
              <Link
                href="/dashboard/customers/new"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                + Create New Customer
              </Link>
            </div>
            <select
              id="customerId"
              name="customerId"
              required
              className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            >
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="serviceType"
              className="text-sm font-semibold text-gray-700"
            >
              Service Type (Manual Entry){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="serviceType"
              name="serviceType"
              required
              type="text"
              placeholder="Ex. RO Water Purifier Repair, Yearly Maintenance"
              className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="plantCategory"
              className="text-sm font-semibold text-gray-700"
            >
              Plant Category
            </label>
            <select
              id="plantCategory"
              name="plantCategory"
              className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            >
              <option value="">Select plant category...</option>
              <option value="DOMESTIC">Domestic Plant</option>
              <option value="INDUSTRIAL">Industrial Plant</option>
              <option value="WATER_TREATMENT">Water Treatment Plant</option>
            </select>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label
                htmlFor="paymentMode"
                className="text-sm font-semibold text-gray-700"
              >
                Payment Mode
              </label>
              <input
                id="paymentMode"
                name="paymentMode"
                type="text"
                placeholder="Ex. Cash, UPI, Card"
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="text-sm font-semibold text-gray-700"
              >
                Amount to be Paid
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="₹ 0.00"
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Payment Status
              </label>
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentStatus"
                    value="PAID"
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-green-600">Paid</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentStatus"
                    value="UNPAID"
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-red-500">Unpaid</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="serviceRegisterDate"
                className="text-sm font-semibold text-gray-700"
              >
                Service Register Date
              </label>
              <input
                id="serviceRegisterDate"
                name="serviceRegisterDate"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="serviceCompleteDate"
                className="text-sm font-semibold text-gray-700"
              >
                Service Complete Date
              </label>
              <input
                id="serviceCompleteDate"
                name="serviceCompleteDate"
                type="date"
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100/50 mt-8">
            <button
              type="submit"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
