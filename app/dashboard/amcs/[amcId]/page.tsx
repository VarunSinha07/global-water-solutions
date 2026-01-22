import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AMCDetailsPage({
  params,
}: {
  params: { amcId: string };
}) {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/amcs"
        className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Contracts
      </Link>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">AMC Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Details for contract ID: {params.amcId}
        </p>
      </div>
    </div>
  );
}
