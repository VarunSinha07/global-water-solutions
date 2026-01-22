import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewComplaintPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/complaints"
        className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Complaints
      </Link>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">New Complaint</h1>
        <p className="text-sm text-gray-500 mt-1">
          Form to create a new complaint ticket will go here.
        </p>
      </div>
    </div>
  );
}
