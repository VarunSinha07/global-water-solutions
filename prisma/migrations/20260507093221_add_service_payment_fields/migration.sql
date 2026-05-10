-- CreateEnum
CREATE TYPE "PlantCategory" AS ENUM ('DOMESTIC', 'INDUSTRIAL', 'WATER_TREATMENT');

-- CreateEnum
CREATE TYPE "ServicePaymentStatus" AS ENUM ('PAID', 'UNPAID');

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "amount" DOUBLE PRECISION,
ADD COLUMN     "paymentMode" TEXT,
ADD COLUMN     "paymentStatus" "ServicePaymentStatus",
ADD COLUMN     "plantCategory" "PlantCategory",
ALTER COLUMN "nextServiceDueDate" SET DEFAULT now() + interval '3 months';
