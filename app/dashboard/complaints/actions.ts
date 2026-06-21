"use server";

import { prisma } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ComplaintStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth-utils";

const complaintSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  serviceId: z.string().min(1, "Service is required"),
  description: z
    .string()
    .min(10, "Description should be at least 10 characters"),
  status: z.nativeEnum(ComplaintStatus),
});

export async function createComplaint(formData: FormData) {
  await requireAdmin();
  try {
    const data = {
      customerId: formData.get("customerId") as string,
      serviceId: formData.get("serviceId") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as string,
    };

    const validatedData = complaintSchema.parse(data);

    await prisma.complaint.create({
      data: {
        customerId: validatedData.customerId,
        serviceId: validatedData.serviceId,
        description: validatedData.description,
        status: validatedData.status as ComplaintStatus,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.flatten().fieldErrors,
      };
    }
    return {
      message: "Failed to create complaint. Please try again.",
    };
  }

  revalidateTag("complaints", "max");
  revalidateTag("dashboard-stats", "max");
  revalidateTag("customers", "max");
  revalidatePath("/dashboard/complaints");
  redirect("/dashboard/complaints");
}
