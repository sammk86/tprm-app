
# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-09-13-initial-tprm-implementation/spec.md

## Schema Overview

The database schema implements the core entities for the TPRM platform: users, companies, vendors, assessments, and related supporting tables. The schema is designed to support role-based access control, vendor management, and basic risk assessment functionality.

## Core Tables

### Users Table
```sql
CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
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
  CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE
);
```

### Companies Table
```sql
CREATE TABLE "Company" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "domain" TEXT,
  "industry" TEXT,
  "size" "CompanySize",
  "address" TEXT,
  "phone" TEXT,
  "website" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
```

### Vendors Table
```sql
CREATE TABLE "Vendor" (
  "id" TEXT NOT NULL PRIMARY KEY,
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
  CONSTRAINT "Vendor_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE,
  CONSTRAINT "Vendor_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT
);
```

### Assessment Templates Table
```sql
CREATE TABLE "AssessmentTemplate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" "AssessmentCategory" NOT NULL,
  "questions" JSONB NOT NULL,
  "riskWeights" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssessmentTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT
);
```

### Assessments Table
```sql
CREATE TABLE "Assessment" (
  "id" TEXT NOT NULL PRIMARY KEY,
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
  CONSTRAINT "Assessment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE,
  CONSTRAINT "Assessment_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "AssessmentTemplate"("id") ON DELETE RESTRICT,
  CONSTRAINT "Assessment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL,
  CONSTRAINT "Assessment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT
);
```

## Enums

### UserRole
```sql
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COMPLIANCE_OFFICER', 'PROCUREMENT_MANAGER');
```

### CompanySize
```sql
CREATE TYPE "CompanySize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');
```

### VendorType
```sql
CREATE TYPE "VendorType" AS ENUM ('GENERAL', 'TECHNOLOGY', 'FINANCIAL', 'HEALTHCARE', 'LEGAL', 'CONSULTING', 'OTHER');
```

### RiskLevel
```sql
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
```

### BusinessCriticality
```sql
CREATE TYPE "BusinessCriticality" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
```

### VendorStatus
```sql
CREATE TYPE "VendorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_REVIEW', 'TERMINATED');
```

### AssessmentCategory
```sql
CREATE TYPE "AssessmentCategory" AS ENUM ('GENERAL', 'CYBERSECURITY', 'FINANCIAL', 'OPERATIONAL', 'COMPLIANCE', 'REPUTATIONAL');
```

### AssessmentStatus
```sql
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED', 'APPROVED', 'REJECTED');
```

## Indexes

### Performance Indexes
```sql
-- User email lookup
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Vendor search and filtering
CREATE INDEX "Vendor_companyId_idx" ON "Vendor"("companyId");
CREATE INDEX "Vendor_status_idx" ON "Vendor"("status");
CREATE INDEX "Vendor_riskLevel_idx" ON "Vendor"("riskLevel");
CREATE INDEX "Vendor_vendorType_idx" ON "Vendor"("vendorType");

-- Assessment queries
CREATE INDEX "Assessment_vendorId_idx" ON "Assessment"("vendorId");
CREATE INDEX "Assessment_status_idx" ON "Assessment"("status");
CREATE INDEX "Assessment_assignedToId_idx" ON "Assessment"("assignedToId");
CREATE INDEX "Assessment_dueDate_idx" ON "Assessment"("dueDate");

-- Assessment template queries
CREATE INDEX "AssessmentTemplate_category_idx" ON "AssessmentTemplate"("category");
CREATE INDEX "AssessmentTemplate_isActive_idx" ON "AssessmentTemplate"("isActive");
```

### Full-Text Search Indexes
```sql
-- Vendor name and description search
CREATE INDEX "Vendor_name_search_idx" ON "Vendor" USING gin(to_tsvector('english', "name"));
CREATE INDEX "Vendor_description_search_idx" ON "Vendor" USING gin(to_tsvector('english', "description"));
```

## Constraints and Validation

### Data Integrity Rules
- **Email Uniqueness**: Each user must have a unique email address
- **Company Association**: All users must belong to a company
- **Vendor Ownership**: All vendors must belong to a company and have a creator
- **Assessment Relationships**: Assessments must reference valid vendors and templates
- **Cascade Deletes**: Deleting a company removes all associated users and vendors
- **Restrict Deletes**: Users cannot be deleted if they have created vendors or assessments

### Business Logic Constraints
- **Risk Score Range**: Risk scores must be between 0-100
- **Email Verification**: Users must verify email before accessing the platform
- **Assessment Due Dates**: Due dates must be in the future when created
- **Vendor Status Transitions**: Proper status transition validation (e.g., can't go from TERMINATED to ACTIVE)

## Migration Strategy

### Initial Migration
```sql
-- Create all enums first
CREATE TYPE "UserRole" AS ENUM (...);
-- ... other enums

-- Create tables in dependency order
CREATE TABLE "Company" (...);
CREATE TABLE "User" (...);
CREATE TABLE "Vendor" (...);
CREATE TABLE "AssessmentTemplate" (...);
CREATE TABLE "Assessment" (...);

-- Create indexes
CREATE INDEX ...;
```

### Data Seeding
```sql
-- Insert default assessment templates
INSERT INTO "AssessmentTemplate" (id, name, category, questions, riskWeights, createdById) VALUES
('template-1', 'General Vendor Risk Assessment', 'GENERAL', '{"questions": [...]}', '{"weights": {...}}', 'admin-user-id'),
('template-2', 'Cybersecurity Assessment', 'CYBERSECURITY', '{"questions": [...]}', '{"weights": {...}}', 'admin-user-id');
```

## Rationale

### Design Decisions
- **UUID Primary Keys**: Using TEXT with UUID for better security and distributed system compatibility
- **JSONB for Flexible Data**: Using JSONB for assessment questions and responses to allow schema flexibility
- **Enum Types**: Using PostgreSQL enums for better data integrity and performance
- **Cascade Relationships**: Proper cascade rules to maintain data integrity
- **Comprehensive Indexing**: Strategic indexes for common query patterns and search functionality

### Performance Considerations
- **Indexed Foreign Keys**: All foreign key columns are indexed for join performance
- **Composite Indexes**: Strategic composite indexes for common filtering combinations
- **Full-Text Search**: GIN indexes for efficient text search on vendor names and descriptions
- **JSONB Indexing**: Potential for JSONB field indexing as the schema evolves

### Security Considerations
- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **Token Expiration**: Email verification and password reset tokens have expiration times
- **Soft Deletes**: Consider implementing soft deletes for audit trails in future iterations
- **Data Isolation**: Company-based data isolation through foreign key relationships
