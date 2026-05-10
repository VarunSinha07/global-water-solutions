import { prisma } from "./lib/db";

async function test() {
  const customer = await prisma.customer.findFirst();
  if (!customer) {
    console.log("No customer found");
    return;
  }
  try {
    const service = await prisma.service.create({
      data: {
        customerId: customer.id,
        serviceType: "Test",
        plantCategory: null,
        paymentMode: null,
        amount: null,
        paymentStatus: null,
      }
    });
    console.log("Success:", service);
  } catch(e) {
    console.error("Prisma Error:", e);
  }
}

test().catch(console.error);
