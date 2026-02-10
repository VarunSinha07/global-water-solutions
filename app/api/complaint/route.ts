import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, serviceId, description } = body;

    if (!customerId || !serviceId || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.create({
      data: {
        customerId,
        serviceId,
        description,
        status: "OPEN", // ✅ perfectly valid Prisma enum
      },
    });

    return NextResponse.json({ complaint }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
