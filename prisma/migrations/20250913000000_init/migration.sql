-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COMPLIANCE_OFFICER', 'PROCUREMENT_MANAGER');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "VendorType" AS ENUM ('GENERAL', 'TECHNOLOGY', 'FINANCIAL', 'HEALTHCARE', 'LEGAL', 'CONSULTING', 'OTHER');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "BusinessCriticality" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_REVIEW', 'TERMINATED');

-- CreateEnum
CREATE TYPE "AssessmentCategory" AS ENUM ('GENERAL', 'CYBERSECURITY', 'FINANCIAL', 'OPERATIONAL', 'COMPLIANCE', 'REPUTATIONAL');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "industry" TEXT,
    "size" "CompanySize",
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'COMPLIANCE_OFFICER',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "description" TEXT,
    "services" TEXT[],
    "vendorType" "VendorType" NOT NULL DEFAULT 'GENERAL',
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "businessCriticality" "BusinessCriticality" NOT NULL DEFAULT 'MEDIUM',
    "status" "VendorStatus" NOT NULL DEFAULT 'ACTIVE',
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "AssessmentCategory" NOT NULL,
    "questions" JSONB NOT NULL,
    "riskWeights" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "responses" JSONB,
    "riskScore" INTEGER,
    "completedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "assignedToId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "vendors_companyId_idx" ON "vendors"("companyId");
CREATE INDEX "vendors_status_idx" ON "vendors"("status");
CREATE INDEX "vendors_riskLevel_idx" ON "vendors"("riskLevel");
CREATE INDEX "vendors_vendorType_idx" ON "vendors"("vendorType");

-- CreateIndex
CREATE INDEX "assessments_vendorId_idx" ON "assessments"("vendorId");
CREATE INDEX "assessments_status_idx" ON "assessments"("status");
CREATE INDEX "assessments_assignedToId_idx" ON "assessments"("assignedToId");
CREATE INDEX "assessments_dueDate_idx" ON "assessments"("dueDate");

-- CreateIndex
CREATE INDEX "assessment_templates_category_idx" ON "assessment_templates"("category");
CREATE INDEX "assessment_templates_isActive_idx" ON "assessment_templates"("isActive");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "assessment_templates" ADD CONSTRAINT "assessment_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "assessment_templates"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT;
