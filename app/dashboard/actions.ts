"use server";

import { prisma } from "@/lib/db";
import { $Enums } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth-utils";
import { unstable_cache } from "next/cache";

// ── Cached query implementations ──

const getCachedDashboardStats = unstable_cache(
  async () => {
    const [totalCustomers, activeAMCs, openComplaintsCount] = await Promise.all([
      prisma.customer.count(),
      prisma.aMCContract.count({
        where: {
          status: $Enums.AMCStatus.ACTIVE,
        },
      }),
      prisma.complaint.count({
        where: {
          status: $Enums.ComplaintStatus.OPEN,
        },
      }),
    ]);

    // Calculate pending amount dynamically with aggregated queries instead of nested O(N) relations
    const paymentGroups = await prisma.payment.groupBy({
      by: ["amcId"],
      where: {
        status: "PAID",
        amcId: { not: null },
      },
      _sum: {
        amount: true,
      },
    });

    const paidMap = new Map<string, number>(
      paymentGroups.map((g) => [g.amcId!, g._sum.amount || 0])
    );

    const contracts = await prisma.aMCContract.findMany({
      select: {
        id: true,
        amount: true,
      },
    });

    let pendingAmount = 0;
    let pendingAMCsCount = 0;

    for (const amc of contracts) {
      const paidAmount = paidMap.get(amc.id) || 0;
      const due = amc.amount - paidAmount;

      if (due > 0) {
        pendingAmount += due;
        pendingAMCsCount++;
      }
    }

    return {
      totalCustomers,
      activeAMCs,
      pendingAMCsCount,
      pendingAmount,
      openComplaintsCount,
    };
  },
  ["dashboard-stats-data"],
  { tags: ["dashboard-stats"] }
);

const getCachedExpiringAMCs = unstable_cache(
  async () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const now = new Date();

    return await prisma.aMCContract.findMany({
      where: {
        status: $Enums.AMCStatus.ACTIVE,
        endDate: {
          lte: thirtyDaysFromNow,
          gte: now,
        },
      },
      take: 5,
      orderBy: {
        endDate: "asc",
      },
      include: {
        customer: true,
        service: true,
      },
    });
  },
  ["expiring-amcs-data"],
  { tags: ["amcs", "dashboard-stats"] }
);

const getCachedRecentComplaints = unstable_cache(
  async () => {
    return await prisma.complaint.findMany({
      where: {
        status: {
          in: [$Enums.ComplaintStatus.OPEN, $Enums.ComplaintStatus.IN_PROGRESS],
        },
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: true,
        service: true,
      },
    });
  },
  ["recent-complaints-data"],
  { tags: ["complaints", "dashboard-stats"] }
);

const getCachedMonthlyRevenue = unstable_cache(
  async (period: "6M" | "1Y" | "ALL") => {
    const startDate = new Date();
    startDate.setDate(1); // Start at the beginning of the current month
    startDate.setHours(0, 0, 0, 0);

    let numMonths = 6;
    if (period === "1Y") numMonths = 12;
    if (period === "ALL") numMonths = 60; // 5 years

    // Go back numMonths
    startDate.setMonth(startDate.getMonth() - numMonths + 1);

    // Fetch payments strictly for essential fields instead of full records
    const payments = await prisma.payment.findMany({
      where: {
        status: "PAID",
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        amount: true,
        createdAt: true,
        paymentDate: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Aggregate by month
    const monthlyData: Record<string, { revenue: number }> = {};
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize last numMonths
    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      let key = months[d.getMonth()];
      if (
        period === "ALL" ||
        period === "1Y" ||
        (period === "6M" && d.getFullYear() !== new Date().getFullYear())
      ) {
        key = `${key} '${d.getFullYear().toString().slice(2)}`;
      }
      monthlyData[key] = { revenue: 0 };
    }

    payments.forEach((payment) => {
      // Prefer paymentDate if exists, else fallback to createdAt
      const d = payment.paymentDate
        ? new Date(payment.paymentDate)
        : new Date(payment.createdAt);
      let key = months[d.getMonth()];
      if (
        period === "ALL" ||
        period === "1Y" ||
        (period === "6M" && d.getFullYear() !== new Date().getFullYear())
      ) {
        key = `${key} '${d.getFullYear().toString().slice(2)}`;
      }
      // Simply sum up the successful payment amounts
      if (monthlyData[key]) {
        monthlyData[key].revenue += payment.amount;
      }
    });

    return Object.entries(monthlyData).map(([name, data]) => ({
      name,
      revenue: data.revenue,
    }));
  },
  ["monthly-revenue-data"],
  { tags: ["payments", "dashboard-stats"] }
);

const getCachedRecentActivity = unstable_cache(
  async () => {
    const payments = await prisma.payment.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        customer: {
          select: { name: true },
        },
      },
    });

    return payments.map((payment) => ({
      id: payment.id,
      type: payment.status === "PAID" ? "Payment Received" : "Payment Pending",
      from: payment.customer.name,
      amount: payment.amount,
      status: payment.status,
      date: payment.createdAt,
    }));
  },
  ["recent-activity-data"],
  { tags: ["payments", "dashboard-stats"] }
);

const getCachedServiceReminders = unstable_cache(
  async () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return await prisma.service.findMany({
      where: {
        nextServiceDueDate: {
          lte: today,
        },
      },
      include: {
        customer: true,
      },
      orderBy: {
        nextServiceDueDate: "asc",
      },
    });
  },
  ["service-reminders-data"],
  { tags: ["services", "dashboard-stats"] }
);

// ── Public API (keeps requireAdmin check outside of cache) ──

export async function getDashboardStats() {
  await requireAdmin();
  return getCachedDashboardStats();
}

export async function getExpiringAMCs() {
  await requireAdmin();
  return getCachedExpiringAMCs();
}

export async function getRecentComplaints() {
  await requireAdmin();
  return getCachedRecentComplaints();
}

export async function getMonthlyRevenue(period: "6M" | "1Y" | "ALL" = "6M") {
  await requireAdmin();
  return getCachedMonthlyRevenue(period);
}

export async function getRecentActivity() {
  await requireAdmin();
  return getCachedRecentActivity();
}

export async function getServiceReminders() {
  await requireAdmin();
  return getCachedServiceReminders();
}

export type SearchResult = {
  id: string;
  type: "Customer" | "AMC" | "Complaint";
  title: string;
  subtitle: string;
  url: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  await requireAdmin();
  if (!query || query.length < 2) return [];

  const [customers, amcs, complaints] = await Promise.all([
    prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 3,
    }),
    prisma.aMCContract.findMany({
      where: {
        OR: [
          { customer: { name: { contains: query, mode: "insensitive" } } },
          {
            service: {
              serviceType: { contains: query, mode: "insensitive" },
            },
          },
        ],
      },
      include: {
        customer: true,
        service: true,
      },
      take: 3,
    }),
    prisma.complaint.findMany({
      where: {
        OR: [{ description: { contains: query, mode: "insensitive" } }],
      },
      include: {
        customer: true,
      },
      take: 3,
    }),
  ]);

  const results: SearchResult[] = [
    ...customers.map((c) => ({
      id: c.id,
      type: "Customer" as const,
      title: c.name,
      subtitle: c.email || "No email",
      url: `/dashboard/customers/${c.id}`,
    })),
    ...amcs.map((a) => ({
      id: a.id,
      type: "AMC" as const,
      title: a.customer.name,
      subtitle: a.service.serviceType,
      url: `/dashboard/amcs/${a.id}`,
    })),
    ...complaints.map((c) => ({
      id: c.id,
      type: "Complaint" as const,
      title:
        c.description.slice(0, 40) + (c.description.length > 40 ? "..." : ""),
      subtitle: c.customer.name,
      url: `/dashboard/complaints/${c.id}`,
    })),
  ];

  return results;
}
