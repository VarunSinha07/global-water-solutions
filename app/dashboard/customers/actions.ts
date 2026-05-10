"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(10, "Phone number must be valid"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  installationDate: z.string().optional(),
  warrantyPeriod: z.string().optional(),
  plantModelName: z.string().optional(),
  plantCategory: z
    .lazy(() => z.enum(["DOMESTIC", "INDUSTRIAL", "WATER_TREATMENT"]))
    .optional(),
  plantCost: z.coerce.number().min(0).optional(),
  paymentMode: z.string().optional(),
  emi: z.coerce.number().min(1).max(4).optional(),
  paymentStatus: z.lazy(() => z.enum(["PAID", "UNPAID"])).optional(),
});

export async function createCustomer(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    installationDate: formData.get("installationDate"),
    warrantyPeriod: formData.get("warrantyPeriod"),
    plantModelName: formData.get("plantModelName"),
    plantCategory: formData.get("plantCategory") || undefined,
    plantCost: formData.get("plantCost") || undefined,
    paymentMode: formData.get("paymentMode") || undefined,
    emi: formData.get("emi") || undefined,
    paymentStatus: formData.get("paymentStatus") || undefined,
  };

  const validatedData = createCustomerSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      error: validatedData.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.customer.create({
      data: {
        name: validatedData.data.name,
        address: validatedData.data.address,
        phone: validatedData.data.phone,
        email: validatedData.data.email || null,
        installationDate: validatedData.data.installationDate
          ? new Date(validatedData.data.installationDate)
          : null,
        warrantyPeriod: validatedData.data.warrantyPeriod || null,
        plantModelName: validatedData.data.plantModelName || null,
        plantCategory: (validatedData.data.plantCategory as any) || null,
        plantCost: validatedData.data.plantCost || null,
        paymentMode: validatedData.data.paymentMode || null,
        emi: validatedData.data.emi || null,
        paymentStatus: (validatedData.data.paymentStatus as any) || null,
      },
    });
  } catch (e) {
    console.error("Failed to create customer:", e);
    return {
      message: "Database Error: Failed to Create Customer.",
    };
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function getCustomers(query?: string, sort?: string) {
  let orderBy: any = { createdAt: "desc" };

  if (sort === "name_asc") {
    orderBy = { name: "asc" };
  } else if (sort === "name_desc") {
    orderBy = { name: "desc" };
  }

  return await prisma.customer.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { address: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: orderBy,
    include: {
      _count: {
        select: { services: true, amcs: true },
      },
    },
  });
}
