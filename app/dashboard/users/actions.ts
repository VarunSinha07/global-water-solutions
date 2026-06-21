"use server";

import { prisma } from "@/lib/db";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { requireAdmin } from "@/lib/auth-utils";

const getCachedUsers = unstable_cache(
  async () => {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
      },
    });
  },
  ["users-list-data"],
  { tags: ["users"] }
);

export async function getUsers() {
  await requireAdmin();
  return getCachedUsers();
}

export async function updateUserRole(userId: string, role: "admin" | "user") {
  await requireAdmin();
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    revalidateTag("users", "max");
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { error: "Failed to update user role" };
  }
}
