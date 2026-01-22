import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="bg-indigo-50 p-6 rounded-full">
        <BarChart3 className="h-12 w-12 text-indigo-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      <p className="text-gray-500 max-w-md">
        Deep insights and reporting features are coming soon. Track your revenue
        and service metrics in one place.
      </p>
    </div>
  );
}
