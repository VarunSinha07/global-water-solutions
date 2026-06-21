"use server";

import { prisma } from "@/lib/db";
import { $Enums } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth-utils";

export async function getComplaintsByStatus() {
  await requireAdmin();
  const result = await prisma.complaint.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  });

  const statuses = [
    $Enums.ComplaintStatus.OPEN,
    $Enums.ComplaintStatus.IN_PROGRESS,
    $Enums.ComplaintStatus.RESOLVED,
  ];
  return statuses.map((status) => {
    const found = result.find((item) => item.status === status);
    return {
      name: status,
      value: found ? found._count.status : 0,
    };
  });
}

export async function getAMCsByStatus() {
  await requireAdmin();
  const result = await prisma.aMCContract.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  });

  const statuses = [
    $Enums.AMCStatus.ACTIVE,
    $Enums.AMCStatus.EXPIRED,
    $Enums.AMCStatus.PENDING_PAYMENT,
  ];
  return statuses.map((status) => {
    const found = result.find((item) => item.status === status);
    return {
      name: status,
      value: found ? found._count.status : 0,
    };
  });
}

export async function getServiceTypesDistribution() {
  await requireAdmin();
  const result = await prisma.service.groupBy({
    by: ["serviceType"],
    _count: {
      serviceType: true,
    },
  });

  return result.map((item) => ({
    name: item.serviceType || "General",
    value: item._count.serviceType,
  }));
}

export async function getCustomersAcquiredOverTime() {
  await requireAdmin();
  // Get last 6 months
  const months = [];
  const monthlyData: Record<string, number> = {};

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    monthlyData[key] = 0;
    months.push(key);
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const customers = await prisma.customer.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    select: {
      createdAt: true,
    },
  });

  customers.forEach((c) => {
    const key = c.createdAt.toLocaleString("en-US", {
      month: "short",
      year: "2-digit",
    });
    if (monthlyData[key] !== undefined) {
      monthlyData[key]++;
    }
  });

  return months.map((month) => ({
    name: month,
    value: monthlyData[month],
  }));
}
