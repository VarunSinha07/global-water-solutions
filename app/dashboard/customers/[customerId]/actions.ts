"use server";

import { prisma } from "@/lib/db";
import { $Enums } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-utils";

export async function getCustomerDetails(customerId: string) {
  await requireAdmin();
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      services: {
        include: {
          amcContracts: true,
          technician: {
            select: { name: true },
          },
          complaints: {
            where: { status: { not: "RESOLVED" } }, // Open complaints count/preview
          },
        },
        orderBy: { serviceRegisterDate: "desc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      complaints: {
        orderBy: { createdAt: "desc" },
        include: {
          technician: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!customer) {
    return null;
  }

  return customer;
}

const serviceSchema = z.object({
  serviceType: z.string().min(2),
  installationDate: z.string().transform((str) => new Date(str)),
});

export async function addService(customerId: string, formData: FormData) {
  await requireAdmin();
  const rawData = {
    serviceType: formData.get("serviceType"),
    installationDate: formData.get("installationDate"),
  };

  const validated = serviceSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: "Invalid data" };
  }

  // Calculate next service due date by adding 3 months to installation date
  const nextDueDate = new Date(validated.data.installationDate);
  nextDueDate.setMonth(nextDueDate.getMonth() + 3);

  // Generate serviceNumber locally
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
  const serviceNumber = `SRV-${dateStr}-${sequence}`;

  await prisma.service.create({
    data: {
      serviceNumber,
      customerId,
      serviceType: validated.data.serviceType,
      serviceRegisterDate: validated.data.installationDate,
      nextServiceDueDate: nextDueDate, // Explictly set based on installation date
      status: $Enums.ServiceStatus.PENDING,
    },
  });

  revalidatePath(`/dashboard/customers/${customerId}`);
  return { success: true };
}

const amcSchema = z.object({
  serviceId: z.string(),
  startDate: z.string().transform((str) => new Date(str)),
  amount: z.coerce.number().min(1),
});

export async function createAMC(customerId: string, formData: FormData) {
  await requireAdmin();
  const rawData = {
    serviceId: formData.get("serviceId"),
    startDate: formData.get("startDate"),
    amount: formData.get("amount"),
  };

  const validated = amcSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: "Invalid AMC Data" };
  }

  const { startDate, amount, serviceId } = validated.data;

  // Calculate End Date (1 Year)
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  // Renewal Date (e.g., 30 days before end)
  const renewalDate = new Date(endDate);
  renewalDate.setDate(renewalDate.getDate() - 30);

  await prisma.aMCContract.create({
    data: {
      customerId,
      serviceId,
      startDate,
      endDate,
      renewalDate,
      amount,
      status: $Enums.AMCStatus.ACTIVE,
    },
  });

  revalidatePath(`/dashboard/customers/${customerId}`);
  return { success: true };
}

const complaintSchema = z.object({
  serviceId: z.string().min(1),
  description: z.string().min(3),
});

export async function logComplaint(customerId: string, formData: FormData) {
  await requireAdmin();
  const rawData = {
    serviceId: formData.get("serviceId"),
    description: formData.get("description"),
  };

  const validated = complaintSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: "Invalid complaint data" };
  }

  await prisma.complaint.create({
    data: {
      customerId,
      serviceId: validated.data.serviceId,
      description: validated.data.description,
      status: $Enums.ComplaintStatus.OPEN,
    },
  });

  revalidatePath(`/dashboard/customers/${customerId}`);
  return { success: true };
}

const paymentSchema = z.object({
  amount: z.coerce.number().positive(),
  paymentMode: z.string().min(1),
  amcId: z.string().optional(),
});

export async function recordPayment(customerId: string, formData: FormData) {
  await requireAdmin();
  const rawData = {
    amount: formData.get("amount"),
    paymentMode: formData.get("paymentMode"),
    amcId: formData.get("amcId"),
  };

  const validated = paymentSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: "Invalid payment data" };
  }

  const amcId =
    validated.data.amcId && validated.data.amcId.length > 0
      ? validated.data.amcId
      : null;

  await prisma.payment.create({
    data: {
      customerId,
      amount: validated.data.amount,
      paymentMode: validated.data.paymentMode,
      amcId: amcId,
      status: $Enums.PaymentStatus.PAID,
      paymentDate: new Date(),
    },
  });

  revalidatePath(`/dashboard/customers/${customerId}`);
  return { success: true };
}
