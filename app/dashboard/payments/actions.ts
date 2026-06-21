"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PaymentStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth-utils";

const paymentSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  amcId: z.string().optional(),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  status: z.nativeEnum(PaymentStatus),
  paymentMode: z.string().min(1, "Payment mode is required"),
  paymentDate: z.string().optional(),
});

export async function createPayment(formData: FormData) {
  await requireAdmin();
  try {
    const data = {
      customerId: formData.get("customerId") as string,
      amcId: formData.get("amcId") as string | undefined,
      amount: formData.get("amount") as string,
      status: formData.get("status") as string,
      paymentMode: formData.get("paymentMode") as string,
      paymentDate: formData.get("paymentDate") as string,
    };

    const validatedData = paymentSchema.parse({
      ...data,
      amcId: data.amcId === "" ? undefined : data.amcId,
    });

    await prisma.payment.create({
      data: {
        customerId: validatedData.customerId,
        amcId: validatedData.amcId,
        amount: validatedData.amount,
        status: validatedData.status as PaymentStatus,
        paymentMode: validatedData.paymentMode,
        paymentDate: validatedData.paymentDate
          ? new Date(validatedData.paymentDate)
          : new Date(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.flatten().fieldErrors,
      };
    }
    return {
      message: "Failed to create payment. Please try again.",
    };
  }

  revalidatePath("/dashboard/payments");
  redirect("/dashboard/payments");
}
