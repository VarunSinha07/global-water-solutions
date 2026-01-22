"use server";

import { prisma } from "@/lib/db";
import { $Enums } from "@/generated/prisma/client";

export async function getDashboardStats() {
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

  // Calculate pending amount dynamically
  // Fetch all contracts with their payments to calculate real pending dues
  const allAMCs = await prisma.aMCContract.findMany({
    include: {
      payments: true,
    },
  });

  let pendingAmount = 0;
  let pendingAMCsCount = 0;

  for (const amc of allAMCs) {
    const paidAmount = amc.payments
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);

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
}

export async function getExpiringAMCs() {
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
}

export async function getRecentComplaints() {
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
}

export async function getMonthlyRevenue() {
  // Fetch last 6 months payments
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  // Fetch payments directly instead of FinanceLog to ensure data shows up from Payment records
  const payments = await prisma.payment.findMany({
    where: {
      status: "PAID",
      createdAt: {
        gte: sixMonthsAgo,
      },
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

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = months[d.getMonth()];
    monthlyData[key] = { revenue: 0 };
  }

  payments.forEach((payment) => {
    // Prefer paymentDate if exists, else fallback to createdAt
    const d = payment.paymentDate
      ? new Date(payment.paymentDate)
      : new Date(payment.createdAt);
    const key = months[d.getMonth()];
    // Simply sum up the successful payment amounts
    if (monthlyData[key]) {
      monthlyData[key].revenue += payment.amount;
    }
  });

  return Object.entries(monthlyData).map(([name, data]) => ({
    name,
    revenue: data.revenue,
  }));
}

export async function getRecentActivity() {
  const payments = await prisma.payment.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: true,
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
}
