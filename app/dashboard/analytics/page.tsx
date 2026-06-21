import { getMonthlyRevenue } from "@/app/dashboard/actions";
import {
  getComplaintsByStatus,
  getAMCsByStatus,
  getServiceTypesDistribution,
} from "./actions";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { ComplaintsChart } from "@/components/analytics/complaints-chart";
import { AMCStatusChart } from "@/components/analytics/amc-status-chart";
import { ServiceTypesChart } from "@/components/analytics/service-types-chart";

export default async function AnalyticsPage() {
  // Fetch all analytics datasets concurrently to speed up page load
  const [
    revenueData6M,
    revenueData1Y,
    revenueDataAll,
    complaintsData,
    amcData,
    serviceTypeData,
  ] = await Promise.all([
    getMonthlyRevenue("6M"),
    getMonthlyRevenue("1Y"),
    getMonthlyRevenue("ALL"),
    getComplaintsByStatus(),
    getAMCsByStatus(),
    getServiceTypesDistribution(),
  ]);

  const revenueData = {
    "6M": revenueData6M,
    "1Y": revenueData1Y,
    ALL: revenueDataAll,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-sans">
          Analytics & Reports
        </h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Deep insights, tracking, and reporting features for your business.
        </p>
      </div>

      {/* Hero Chart - Revenue Analytics */}
      <div className="w-full h-[380px] md:h-[450px]">
        <OverviewChart data={revenueData} />
      </div>

      {/* Grid of secondary charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ComplaintsChart data={complaintsData} />
        <AMCStatusChart data={amcData} />
        <ServiceTypesChart data={serviceTypeData} />
      </div>
    </div>
  );
}
