"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createCustomer } from "../actions";
import { useFormStatus } from "react-dom";
import { useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
    >
      <Save className="mr-2 h-4 w-4" />
      {pending ? "Saving..." : "Create Customer"}
    </button>
  );
}

export default function NewCustomerPage() {
  const [state, setState] = useState<{
    error?: Record<string, string[]>;
    message?: string;
  } | null>(null);

  async function clientAction(formData: FormData) {
    const result = await createCustomer(formData);
    if (result?.error || result?.message) {
      setState(result);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/customers"
          className="group inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2.5 transition-all hover:border-indigo-200 hover:bg-indigo-50"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500 transition-colors group-hover:text-indigo-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Add New Customer
          </h2>
          <p className="text-sm text-gray-500">
            Enter details to register a new customer in the system.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <form action={clientAction} className="p-8">
          {state?.message && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{state.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-x-6 gap-y-8 md:grid-cols-2">
            <div className="space-y-2 col-span-2">
              <label
                htmlFor="name"
                className="text-sm font-semibold text-gray-700"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                required
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                placeholder="Ex. John Doe"
              />
              {state?.error?.name && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                  {state.error.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-semibold text-gray-700"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                required
                type="tel"
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                placeholder="Ex. 9876543210"
              />
              {state?.error?.phone && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                  {state.error.phone[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                placeholder="Ex. john@example.com"
              />
              {state?.error?.email && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                  {state.error.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <label
                htmlFor="address"
                className="text-sm font-semibold text-gray-700"
              >
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                placeholder="Ex. 123, Main Street, City"
              />
              {state?.error?.address && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                  {state.error.address[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="installationDate"
                className="text-sm font-semibold text-gray-700"
              >
                Installation Date
              </label>
              <input
                id="installationDate"
                name="installationDate"
                type="date"
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
              {state?.error?.installationDate && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                  {state.error.installationDate[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="warrantyPeriod"
                className="text-sm font-semibold text-gray-700"
              >
                Warranty Period
              </label>
              <input
                id="warrantyPeriod"
                name="warrantyPeriod"
                type="text"
                placeholder="Ex. 1 Year, 6 Months"
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
              {state?.error?.warrantyPeriod && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                  {state.error.warrantyPeriod[0]}
                </p>
              )}
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label
                htmlFor="plantModelName"
                className="text-sm font-semibold text-gray-700"
              >
                Plant Model Name
              </label>
              <input
                id="plantModelName"
                name="plantModelName"
                type="text"
                placeholder="Ex. AquaGuard Pro"
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
              {state?.error?.plantModelName && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                  {state.error.plantModelName[0]}
                </p>
              )}
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label
                htmlFor="plantCategory"
                className="text-sm font-semibold text-gray-700"
              >
                Plant Category
              </label>
              <select
                id="plantCategory"
                name="plantCategory"
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
              >
                <option value="">Select Category</option>
                <option value="DOMESTIC">Domestic Plant</option>
                <option value="INDUSTRIAL">Industrial Plant</option>
                <option value="WATER_TREATMENT">Water Treatment Plant</option>
              </select>
              {state?.error?.plantCategory && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                  {state.error.plantCategory[0]}
                </p>
              )}
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label
                htmlFor="plantCost"
                className="text-sm font-semibold text-gray-700"
              >
                Plant Cost
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">
                  Rs.
                </span>
                <input
                  id="plantCost"
                  name="plantCost"
                  type="number"
                  min="0"
                  placeholder="10000"
                  className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 pl-10 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              {state?.error?.plantCost && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                  {state.error.plantCost[0]}
                </p>
              )}
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label
                htmlFor="paymentMode"
                className="text-sm font-semibold text-gray-700"
              >
                Payment Mode
              </label>
              <select
                id="paymentMode"
                name="paymentMode"
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
              >
                <option value="">Select Mode</option>
                <option value="Gpay">Gpay</option>
                <option value="Cash">Cash</option>
                <option value="Account">Account</option>
              </select>
              {state?.error?.paymentMode && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                  {state.error.paymentMode[0]}
                </p>
              )}
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label
                htmlFor="emi"
                className="text-sm font-semibold text-gray-700"
              >
                EMI Iterations
              </label>
              <select
                id="emi"
                name="emi"
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
              >
                <option value="">Select EMI</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
              {state?.error?.emi && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                  {state.error.emi[0]}
                </p>
              )}
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label
                htmlFor="paymentStatus"
                className="text-sm font-semibold text-gray-700"
              >
                Payment Status
              </label>
              <select
                id="paymentStatus"
                name="paymentStatus"
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
              >
                <option value="">Select Status</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
              </select>
              {state?.error?.paymentStatus && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                  {state.error.paymentStatus[0]}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100/50">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
