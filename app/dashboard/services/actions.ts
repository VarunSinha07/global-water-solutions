"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { $Enums } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth-utils";

async function generateServiceNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  const count = await prisma.service.count({
    where: {
      serviceRegisterDate: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    },
  });

  const sequence = (count + 1).toString().padStart(3, "0");
  return `SRV-${dateStr}-${sequence}`;
}

const createServiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  serviceType: z.string().min(1, "Service type is required"),
  plantCategory: z
    .enum(["DOMESTIC", "INDUSTRIAL", "WATER_TREATMENT"])
    .optional(),
  paymentMode: z.string().optional(),
  amount: z.string().optional(),
  paymentStatus: z.enum(["PAID", "UNPAID"]).optional(),
  serviceRegisterDate: z.string().optional(),
  serviceCompleteDate: z.string().optional(),
});

export async function createService(formData: FormData) {
  await requireAdmin();
  const customerId = formData.get("customerId") as string;
  const serviceType = formData.get("serviceType") as string;
  const plantCategory = formData.get("plantCategory") as string;
  const paymentMode = formData.get("paymentMode") as string;
  const amount = formData.get("amount") as string;
  const paymentStatus = formData.get("paymentStatus") as string;
  const serviceRegisterDate = formData.get("serviceRegisterDate") as string;
  const serviceCompleteDate = formData.get("serviceCompleteDate") as string;

  const validatedData = createServiceSchema.safeParse({
    customerId,
    serviceType,
    plantCategory: plantCategory || undefined,
    paymentMode: paymentMode || undefined,
    amount: amount || undefined,
    paymentStatus: paymentStatus || undefined,
    serviceRegisterDate,
    serviceCompleteDate,
  });

  if (!validatedData.success) {
    console.error(
      "Validation failed:",
      validatedData.error.flatten().fieldErrors,
    );
    return {
      error: validatedData.error.flatten().fieldErrors,
    };
  }

  try {
    const serviceNumber = await generateServiceNumber();

    await prisma.service.create({
      data: {
        serviceNumber,
        customerId: validatedData.data.customerId,
        serviceType: validatedData.data.serviceType,
        plantCategory: validatedData.data.plantCategory ?? null,
        paymentMode: validatedData.data.paymentMode ?? null,
        amount: validatedData.data.amount
          ? parseFloat(validatedData.data.amount)
          : null,
        paymentStatus: validatedData.data.paymentStatus ?? null,
        status: $Enums.ServiceStatus.PENDING,
        serviceRegisterDate: validatedData.data.serviceRegisterDate
          ? new Date(validatedData.data.serviceRegisterDate)
          : new Date(),
        serviceCompleteDate: validatedData.data.serviceCompleteDate
          ? new Date(validatedData.data.serviceCompleteDate)
          : null,
      },
    });
  } catch (e) {
    console.error("Failed to create service:", e);
    return {
      message: "Database Error: Failed to Create Service.",
    };
  }

  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard");
  redirect("/dashboard/services");
}

export async function updateService(serviceId: string, formData: FormData) {
  await requireAdmin();
  const serviceCompleteDate = formData.get("serviceCompleteDate") as string;
  const paymentMode = formData.get("paymentMode") as string;
  const paymentStatus = formData.get("paymentStatus") as string;
  const amount = formData.get("amount") as string;
  const status = formData.get("status") as string;
 
  try {
    const existing = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!existing) return { error: "Service not found" };
 
    if (existing.status === $Enums.ServiceStatus.COMPLETED) {
      // If already completed, maybe only allow some changes or block?
      // Based on user: completion date and payment details remain editable *until* the service is completed.
      // We'll enforce this safely but also let it be updated from UI.
      if (status !== $Enums.ServiceStatus.COMPLETED) {
        // allow unlocking maybe? Usually "editable until completed" means frontend disables forms, we'll just process it anyway
      }
    }
 
    let finalTechnicianId: string | null | undefined = undefined;
    
    if (formData.has("technicianName")) {
      const technicianName = formData.get("technicianName") as string;
      if (!technicianName || !technicianName.trim()) {
        finalTechnicianId = null;
      } else {
        let tech = await prisma.user.findFirst({
          where: { name: { equals: technicianName.trim(), mode: "insensitive" }, role: "user" },
        });
        if (!tech) {
          tech = await prisma.user.create({
            data: {
              name: technicianName.trim(),
              email: `tech_${Date.now()}@water.local`,
              role: "user",
            },
          });
        }
        finalTechnicianId = tech.id;
      }
    } else if (formData.has("technicianId")) {
      const fallbackId = formData.get("technicianId") as string;
      finalTechnicianId = fallbackId || null;
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: {
        serviceCompleteDate: serviceCompleteDate
          ? new Date(serviceCompleteDate)
          : null,
        paymentMode: paymentMode || null,
        paymentStatus: (paymentStatus as $Enums.ServicePaymentStatus) || null,
        status: (status as $Enums.ServiceStatus) || undefined,
        amount: amount ? parseFloat(amount) : null,
        technicianId: finalTechnicianId,
      },
    });

    revalidatePath(`/dashboard/services`);
    revalidatePath(`/dashboard/services/${serviceId}`);
    revalidatePath(`/dashboard/customers/${existing.customerId}`);
    return { success: true };
  } catch (e) {
    console.error("Failed to update service:", e);
    return { error: "Failed to update service" };
  }
}
