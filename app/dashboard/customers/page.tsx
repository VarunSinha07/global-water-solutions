import Link from "next/link";
import { Plus, Phone, MapPin, ChevronRight, Users, Search, SlidersHorizontal } from "lucide-react";
import { getCustomers } from "./actions";
import { SearchInput } from "@/components/ui/search-input";
import { FilterDialog, FilterCategory } from "@/components/ui/filter-dialog";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string; sort?: string }>;
}) {
  const query = (await searchParams)?.query || "";
  const sort = (await searchParams)?.sort || "";
  const customers = await getCustomers(query, sort);

  const customerFilters: FilterCategory[] = [
    {
      id: "sort",
      label: "Sort By",
      type: "radio",
      options: [
        { label: "Newest First", value: "" },
        { label: "Name (A-Z)", value: "name_asc" },
        { label: "Name (Z-A)", value: "name_desc" },
      ],
    },
  ];

  // Generate a consistent avatar color per customer name
  const avatarColors = [
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-teal-100 text-teal-700",
  ];

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'DM Sans', 'Sora', sans-serif" }}
    >
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="relative mb-10 pb-8 border-b border-slate-200">
        {/* Decorative accent line */}
        <div className="absolute bottom-0 left-0 h-px w-24 bg-indigo-500" />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Icon badge */}
            <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
              <Users className="h-6 w-6 text-white" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500 mb-1">
                Customer Management
              </p>
              <h1
                className="text-3xl font-bold text-slate-900 leading-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                Customers
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {customers.length} total &mdash; manage accounts and service history
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/customers/new"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Add Customer
          </Link>
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          {/* Wrap SearchInput — pl-10 pushes text past the icon */}
          <div className="[&_input]:pl-10 [&_input]:rounded-xl [&_input]:border-slate-200 [&_input]:bg-white [&_input]:text-sm [&_input]:shadow-sm [&_input]:ring-1 [&_input]:ring-slate-200 [&_input:focus]:ring-2 [&_input:focus]:ring-indigo-400 [&_input:focus]:border-indigo-400 [&_input:focus]:outline-none">
            <SearchInput placeholder="Search name or phone…" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FilterDialog filters={customerFilters} />
        </div>
      </div>

      {/* ── Table Card ──────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Card header stripe */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            All Customers
          </span>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600 ring-1 ring-indigo-100">
            {customers.length}
          </span>
        </div>

        <div className="relative w-full overflow-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100">
                {["Customer", "Phone", "Address", "Services", ""].map((h) => (
                  <th
                    key={h}
                    className={`h-11 px-6 align-middle text-[11px] font-semibold uppercase tracking-wider text-slate-400 ${
                      h === "Services" ? "text-center" : h === "" ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
                        <Users className="h-7 w-7 text-slate-300" />
                      </div>
                      <p className="text-slate-400 text-sm">
                        No customers match your search.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer, i) => {
                  const colorClass = avatarColors[i % avatarColors.length];
                  return (
                    <tr
                      key={customer.id}
                      className="group border-b border-slate-100 last:border-0 transition-colors duration-150 hover:bg-indigo-50/40"
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-3.5">
                          {/* Avatar */}
                          <div
                            className={`h-9 w-9 shrink-0 rounded-xl ${colorClass} flex items-center justify-center text-xs font-bold uppercase`}
                          >
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/customers/${customer.id}`}
                              className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors duration-150"
                            >
                              {customer.name}
                            </Link>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {customer.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                          <span className="font-medium text-sm tabular-nums">
                            {customer.phone}
                          </span>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-6 py-4 align-middle max-w-[220px]">
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                          <span
                            className="truncate text-sm"
                            title={customer.address}
                          >
                            {customer.address}
                          </span>
                        </div>
                      </td>

                      {/* Services badge */}
                      <td className="px-6 py-4 align-middle text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                            customer._count.services > 0
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                              : "bg-slate-100 text-slate-500 ring-slate-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              customer._count.services > 0
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {customer._count.services} Active
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 align-middle text-right">
                        <Link
                          href={`/dashboard/customers/${customer.id}`}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-600 opacity-0 ring-1 ring-inset ring-indigo-200 bg-indigo-50 transition-all duration-150 group-hover:opacity-100 hover:bg-indigo-100"
                        >
                          View
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {customers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/60">
            <p className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-600">{customers.length}</span> customers
            </p>
            <p className="text-xs text-slate-400">
              Last updated just now
            </p>
          </div>
        )}
      </div>
    </div>
  );
}