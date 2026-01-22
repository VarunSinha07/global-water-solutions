import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PaymentDetailsPage({
  params,
}: {
  params: { paymentId: string };
}) {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/payments"
        className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Payments
      </Link>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Payment Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Details for payment ID: {params.paymentId}
        </p>
      </div>
    </div>
  );
}
