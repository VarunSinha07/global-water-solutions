"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createServiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  serviceType: z.string().min(1, "Service type is required"),
  plantCategory: z.enum(["DOMESTIC", "INDUSTRIAL", "WATER_TREATMENT"]).optional(),
  paymentMode: z.string().optional(),
  amount: z.string().optional(),
  paymentStatus: z.enum(["PAID", "UNPAID"]).optional(),
  serviceRegisterDate: z.string().optional(),
  serviceCompleteDate: z.string().optional(),
});

export async function createService(formData: FormData) {
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
    console.error("Validation failed:", validatedData.error.flatten().fieldErrors);
    return {
      error: validatedData.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.service.create({
      data: {
        customerId: validatedData.data.customerId,
        serviceType: validatedData.data.serviceType,
        plantCategory: validatedData.data.plantCategory ?? null,
        paymentMode: validatedData.data.paymentMode ?? null,
        amount: validatedData.data.amount ? parseFloat(validatedData.data.amount) : null,
        paymentStatus: validatedData.data.paymentStatus ?? null,
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
