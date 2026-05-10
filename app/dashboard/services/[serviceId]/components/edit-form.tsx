"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Calendar, CheckCircle } from "lucide-react";
import { updateService } from "../../actions";

export function EditServiceForm({ service, technicians }: { service: any, technicians: any[] }) {
  const router = useRouter();
  const isCompleted = service.status === "COMPLETED";

  const [status, setStatus] = useState(service.status);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateService(service.id, formData);
    setLoading(false);
    if (!res.error) {
      router.refresh();
    } else {
      alert(res.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Status
          </label>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isCompleted}
            className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-60 disabled:bg-slate-50 transition-all"
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Assigned Technician
          </label>
          <input
            type="text"
            name="technicianName"
            list="technician-list"
            defaultValue={service.technician?.name || ""}
            disabled={isCompleted}
            placeholder="Type technician name..."
            className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-60 disabled:bg-slate-50 transition-all"
          />
          <datalist id="technician-list">
            {technicians.map((tech) => (
              <option key={tech.id} value={tech.name} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Completion Date
          </label>
          <input
            type="date"
            name="serviceCompleteDate"
            defaultValue={
              service.serviceCompleteDate
                ? new Date(service.serviceCompleteDate)
                    .toISOString()
                    .split("T")[0]
                : ""
            }
            disabled={isCompleted}
            className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-60 disabled:bg-slate-50 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Payment Mode
          </label>
          <select
            name="paymentMode"
            defaultValue={service.paymentMode || ""}
            disabled={isCompleted}
            className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-60 disabled:bg-slate-50 transition-all"
          >
            <option value="">Select Mode</option>
            <option value="Gpay">Gpay</option>
            <option value="Cash">Cash</option>
            <option value="Account">Account</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Amount (Rs.)
          </label>
          <input
            type="number"
            name="amount"
            defaultValue={service.amount || ""}
            disabled={isCompleted}
            placeholder="e.g. 1500"
            className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-60 disabled:bg-slate-50 transition-all"
          />
        </div>
      </div>

      {!isCompleted ? (
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-center p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 text-sm font-medium">
          <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
          This service is completed. Edit fields are locked to preserve history.
        </div>
      )}
    </form>
  );
}
