"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
};

export async function getUserNotifications() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return [];

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
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

  return { success: true };
}

// Internal function to seed/create notifications for demo
export async function seedDemoNotifications() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return;

  const count = await prisma.notification.count({
    where: { userId: session.user.id },
  });

  if (count === 0) {
    await prisma.notification.createMany({
      data: [
        {
          userId: session.user.id,
          title: "COMPLAINT UPDATE",
          message: "Your complaint status updated to: RESOLVED",
          type: "SUCCESS",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        },
        {
          userId: session.user.id,
          title: "COMPLAINT UPDATE",
          message: "Your complaint status updated to: IN_PROGRESS",
          type: "INFO",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        },
        {
          userId: session.user.id,
          title: "COMPLAINT UPDATE",
          message:
            "Your complaint has been registered. Our team will contact you soon.",
          type: "INFO",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
        },
      ],
    });
  }
}
