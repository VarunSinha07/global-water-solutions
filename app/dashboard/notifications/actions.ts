"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidateTag, unstable_cache } from "next/cache";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
};

const getCachedUserNotifications = unstable_cache(
  async (userId: string) => {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },
  ["user-notifications-data"],
  { tags: ["notifications"] }
);

export async function getUserNotifications() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return [];

  return getCachedUserNotifications(session.user.id);
}

export async function markNotificationAsRead(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "Unauthorized" };

  await prisma.notification.update({
    where: { id, userId: session.user.id },
    data: { isRead: true },
  });

  revalidateTag("notifications", "max");
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "Unauthorized" };

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  revalidateTag("notifications", "max");
  return { success: true };
}

// Check for services due for servicing and create notifications
export async function checkAndCreateServiceNotifications() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "Unauthorized" };

  // Only admins can check service notifications
  if (session.user.role !== "admin") {
    return { error: "Only admins can view service notifications" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Re-fetch all services where nextServiceDueDate is today or in the past
  const servicesDue = await prisma.service.findMany({
    where: {
      nextServiceDueDate: {
        lte: today,
      },
    },
    include: {
      customer: true,
    },
  });

  console.log(`📊 Found ${servicesDue.length} services due for maintenance`);

  if (servicesDue.length === 0) {
    return { count: 0, message: "No services due for servicing" };
  }

  // Create notifications for admin only
  const adminUsers = await prisma.user.findMany({
    where: {
      role: "admin",
    },
  });

  console.log(`👥 Found ${adminUsers.length} admin users`);

  // Fetch all existing unread service notifications to avoid N+1 queries
  const existingNotifications = await prisma.notification.findMany({
    where: {
      title: "SERVICE DUE FOR MAINTENANCE",
      isRead: false,
    },
    select: { userId: true, message: true },
  });

  const newNotificationsData = [];

  for (const service of servicesDue) {
    for (const admin of adminUsers) {
      const alreadyNotified = existingNotifications.some(
        (n) => n.userId === admin.id && n.message.includes(service.id),
      );

      if (!alreadyNotified) {
        newNotificationsData.push({
          userId: admin.id,
          title: "SERVICE DUE FOR MAINTENANCE",
          message: `Service for customer "${service.customer.name}" (${service.serviceType}) is due for maintenance. [Service ID: ${service.id}]`,
          type: "WARNING",
          isRead: false,
        });
      }
    }
  }

  if (newNotificationsData.length > 0) {
    await prisma.notification.createMany({
      data: newNotificationsData,
    });
    revalidateTag("notifications", "max");
  }

  console.log(`✅ Created ${newNotificationsData.length} new notifications`);

  return {
    count: servicesDue.length,
    message: "Service notifications created",
  };
}

// Check for AMC contracts expiring soon and create notifications
export async function checkAndCreateContractExpiryNotifications() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "Unauthorized" };

  // Only admins can check contract notifications
  if (session.user.role !== "admin") {
    return { error: "Only admins can view contract notifications" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);

  // Find all active contracts expiring within the next 30 days
  const contractsExpiring = await prisma.aMCContract.findMany({
    where: {
      status: "ACTIVE",
      endDate: {
        gte: today,
        lte: thirtyDaysLater,
      },
    },
    include: {
      customer: true,
      service: true,
    },
  });

  console.log(`📊 Found ${contractsExpiring.length} contracts expiring soon`);

  if (contractsExpiring.length === 0) {
    return { count: 0, message: "No contracts expiring soon" };
  }

  // Create notifications for admin only
  const adminUsers = await prisma.user.findMany({
    where: {
      role: "admin",
    },
  });

  console.log(`👥 Found ${adminUsers.length} admin users`);

  // Fetch all existing unread AMC notifications to avoid N+1 queries
  const existingNotifications = await prisma.notification.findMany({
    where: {
      title: "AMC CONTRACT EXPIRING SOON",
      isRead: false,
    },
    select: { userId: true, message: true },
  });

  const newNotificationsData = [];

  for (const contract of contractsExpiring) {
    for (const admin of adminUsers) {
      const alreadyNotified = existingNotifications.some(
        (n) => n.userId === admin.id && n.message.includes(contract.id),
      );

      if (!alreadyNotified) {
        newNotificationsData.push({
          userId: admin.id,
          title: "AMC CONTRACT EXPIRING SOON",
          message: `AMC Contract for customer "${contract.customer.name}" (${contract.service.serviceType}) is expiring on ${contract.endDate.toLocaleDateString()}. [Contract ID: ${contract.id}]`,
          type: "WARNING",
          isRead: false,
        });
      }
    }
  }

  if (newNotificationsData.length > 0) {
    await prisma.notification.createMany({
      data: newNotificationsData,
    });
    revalidateTag("notifications", "max");
  }

  console.log(
    `✅ Created ${newNotificationsData.length} new contract expiry notifications`,
  );

  return {
    count: contractsExpiring.length,
    message: "Contract expiry notifications created",
  };
}

// Get notification with full service details
export async function getNotificationWithServiceDetails(
  notificationId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "Unauthorized" };

  // Get the notification
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId, userId: session.user.id },
  });

  if (!notification) {
    return { error: "Notification not found" };
  }

  // Check if it's a SERVICE notification
  const serviceIdMatch = notification.message.match(/\[Service ID: ([^\]]+)\]/);

  if (serviceIdMatch) {
    const serviceId = serviceIdMatch[1];

    // Get full service details with customer, AMC, and payment info
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        customer: true,
        amcContracts: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!service) {
      return { error: "Service not found" };
    }

    return {
      notification,
      type: "service",
      service: {
        id: service.id,
        serviceType: service.serviceType,
        serviceRegisterDate: service.serviceRegisterDate,
        installationDate: service.customer.installationDate,
        nextServiceDueDate: service.nextServiceDueDate,
        customer: service.customer,
        amcContracts: service.amcContracts,
      },
    };
  }

  // Check if it's a CONTRACT notification
  const contractIdMatch = notification.message.match(
    /\[Contract ID: ([^\]]+)\]/,
  );

  if (contractIdMatch) {
    const contractId = contractIdMatch[1];

    // Get full contract details
    const contract = await prisma.aMCContract.findUnique({
      where: { id: contractId },
      include: {
        customer: true,
        service: true,
        payments: true,
      },
    });

    if (!contract) {
      return { error: "Contract not found" };
    }

    return {
      notification,
      type: "contract",
      contract,
    };
  }

  return { error: "Related entity ID not found in notification" };
}

// Mark a service as serviced and reset the due date
export async function markServiceAsServiced(serviceId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "Unauthorized" };

  if (session.user.role !== "admin") {
    return { error: "Only admins can mark services as serviced" };
  }

  // Get the service to calculate which service cycle this is
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      customer: true,
    },
  });

  if (!service) {
    return { error: "Service not found" };
  }

  if (!service.customer.installationDate) {
    return { error: "Customer installation date is not set" };
  }

  // Calculate which service cycle this is based on installation date
  const monthsSinceInstallation = Math.floor(
    (new Date().getTime() -
      new Date(service.customer.installationDate).getTime()) /
      (1000 * 60 * 60 * 24 * 30),
  );

  // Determine service cycle (1st = 3 months, 2nd = 6 months, 3rd = 9 months, 4th = 12 months)
  const serviceCycle = Math.ceil(monthsSinceInstallation / 3);

  // Calculate next service due date (3 months from now)
  const nextDueDate = new Date();
  nextDueDate.setMonth(nextDueDate.getMonth() + 3);

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      nextServiceDueDate: nextDueDate,
    },
  });

  // Delete related notifications (remove from list since service is completed)
  await prisma.notification.deleteMany({
    where: {
      message: {
        contains: serviceId,
      },
    },
  });

  revalidateTag("services", "max");
  revalidateTag("dashboard-stats", "max");
  revalidateTag("notifications", "max");

  return {
    success: true,
    message: "Service marked as serviced",
    nextServiceDueDate: nextDueDate,
    serviceCycle: serviceCycle,
  };
}
