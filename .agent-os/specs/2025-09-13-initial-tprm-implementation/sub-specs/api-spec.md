# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-13-initial-tprm-implementation/spec.md

## API Overview

The TPRM API provides RESTful endpoints for user authentication, vendor management, and basic assessment functionality. All endpoints are built using Next.js API routes with TypeScript and Prisma integration.

## Authentication Endpoints

### POST /api/auth/register

**Purpose:** Register a new user account with email verification
**Parameters:** 
- `email` (string, required): User's email address
- `password` (string, required): User's password (min 8 chars)
- `firstName` (string, required): User's first name
- `lastName` (string, required): User's last name
- `companyName` (string, required): Company name
- `role` (string, optional): User role (default: COMPLIANCE_OFFICER)

**Response:** 
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "userId": "uuid"
}
```

**Errors:**
- `400` - Invalid input data or validation errors
- `409` - Email already exists
- `500` - Server error during registration

### POST /api/auth/login

**Purpose:** Authenticate user and create session
**Parameters:**
- `email` (string, required): User's email address
- `password` (string, required): User's password

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "COMPLIANCE_OFFICER",
    "companyId": "uuid"
  },
  "token": "jwt-token"
}
```

**Errors:**
- `400` - Invalid credentials
- `401` - Email not verified
- `404` - User not found

### POST /api/auth/verify-email

**Purpose:** Verify user email with token
**Parameters:**
- `token` (string, required): Email verification token

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Errors:**
- `400` - Invalid or expired token
- `404` - User not found

### POST /api/auth/logout

**Purpose:** Logout user and invalidate session
**Parameters:** None (uses session token)

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Vendor Management Endpoints

### GET /api/vendors

**Purpose:** Get paginated list of vendors for the user's company
**Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search term for vendor name/description
- `status` (string, optional): Filter by vendor status
- `riskLevel` (string, optional): Filter by risk level
- `vendorType` (string, optional): Filter by vendor type

**Response:**
```json
{
  "success": true,
  "vendors": [
    {
      "id": "uuid",
      "name": "Vendor Name",
      "contactEmail": "vendor@example.com",
      "vendorType": "TECHNOLOGY",
      "riskLevel": "MEDIUM",
      "status": "ACTIVE",
      "createdAt": "2025-09-13T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### POST /api/vendors

**Purpose:** Create a new vendor
**Parameters:**
- `name` (string, required): Vendor name
- `contactEmail` (string, optional): Vendor contact email
- `contactPhone` (string, optional): Vendor contact phone
- `website` (string, optional): Vendor website
- `address` (string, optional): Vendor address
- `description` (string, optional): Vendor description
- `services` (array, optional): Array of services provided
- `vendorType` (string, required): Type of vendor
- `riskLevel` (string, optional): Initial risk level (default: MEDIUM)
- `businessCriticality` (string, optional): Business criticality (default: MEDIUM)

**Response:**
```json
{
  "success": true,
  "vendor": {
    "id": "uuid",
    "name": "Vendor Name",
    "contactEmail": "vendor@example.com",
    "vendorType": "TECHNOLOGY",
    "riskLevel": "MEDIUM",
    "status": "ACTIVE",
    "createdAt": "2025-09-13T00:00:00Z"
  }
}
```

### GET /api/vendors/[id]

**Purpose:** Get specific vendor details
**Parameters:**
- `id` (string, required): Vendor ID

**Response:**
```json
{
  "success": true,
  "vendor": {
    "id": "uuid",
    "name": "Vendor Name",
    "contactEmail": "vendor@example.com",
    "contactPhone": "+1234567890",
    "website": "https://vendor.com",
    "address": "123 Main St",
    "description": "Vendor description",
    "services": ["Service 1", "Service 2"],
    "vendorType": "TECHNOLOGY",
    "riskLevel": "MEDIUM",
    "businessCriticality": "HIGH",
    "status": "ACTIVE",
    "createdAt": "2025-09-13T00:00:00Z",
    "updatedAt": "2025-09-13T00:00:00Z"
  }
}
```

### PUT /api/vendors/[id]

**Purpose:** Update vendor information
**Parameters:** Same as POST /api/vendors (all optional except id)

**Response:**
```json
{
  "success": true,
  "vendor": {
    "id": "uuid",
    "name": "Updated Vendor Name",
    // ... other fields
  }
}
```

### DELETE /api/vendors/[id]

**Purpose:** Delete vendor (soft delete by setting status to TERMINATED)
**Parameters:**
- `id` (string, required): Vendor ID

**Response:**
```json
{
  "success": true,
  "message": "Vendor deleted successfully"
}
```

## Assessment Endpoints

### GET /api/assessments/templates

**Purpose:** Get available assessment templates
**Parameters:**
- `category` (string, optional): Filter by assessment category

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "uuid",
      "name": "General Vendor Risk Assessment",
      "description": "Comprehensive risk assessment template",
      "category": "GENERAL",
      "questionCount": 25
    }
  ]
}
```

### POST /api/assessments

**Purpose:** Create a new assessment for a vendor
**Parameters:**
- `vendorId` (string, required): Target vendor ID
- `templateId` (string, required): Assessment template ID
- `dueDate` (string, optional): Assessment due date (ISO string)
- `assignedToId` (string, optional): User ID to assign assessment to

**Response:**
```json
{
  "success": true,
  "assessment": {
    "id": "uuid",
    "vendorId": "uuid",
    "templateId": "uuid",
    "status": "DRAFT",
    "dueDate": "2025-10-13T00:00:00Z",
    "createdAt": "2025-09-13T00:00:00Z"
  }
}
```

### GET /api/assessments

**Purpose:** Get paginated list of assessments
**Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `status` (string, optional): Filter by assessment status
- `vendorId` (string, optional): Filter by vendor ID

**Response:**
```json
{
  "success": true,
  "assessments": [
    {
      "id": "uuid",
      "vendor": {
        "id": "uuid",
        "name": "Vendor Name"
      },
      "template": {
        "id": "uuid",
        "name": "General Risk Assessment"
      },
      "status": "IN_PROGRESS",
      "riskScore": 65,
      "dueDate": "2025-10-13T00:00:00Z",
      "createdAt": "2025-09-13T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

### GET /api/assessments/[id]

**Purpose:** Get specific assessment details
**Parameters:**
- `id` (string, required): Assessment ID

**Response:**
```json
{
  "success": true,
  "assessment": {
    "id": "uuid",
    "vendor": {
      "id": "uuid",
      "name": "Vendor Name"
    },
    "template": {
      "id": "uuid",
      "name": "General Risk Assessment",
      "questions": [...]
    },
    "status": "IN_PROGRESS",
    "responses": {...},
    "riskScore": 65,
    "dueDate": "2025-10-13T00:00:00Z",
    "createdAt": "2025-09-13T00:00:00Z"
  }
}
```

### PUT /api/assessments/[id]/responses

**Purpose:** Update assessment responses and calculate risk score
**Parameters:**
- `id` (string, required): Assessment ID
- `responses` (object, required): Assessment responses object

**Response:**
```json
{
  "success": true,
  "assessment": {
    "id": "uuid",
    "status": "COMPLETED",
    "riskScore": 75,
    "responses": {...},
    "updatedAt": "2025-09-13T00:00:00Z"
  }
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Email is required"
    }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Authentication failed
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `INTERNAL_ERROR` - Server error

## Authentication and Authorization

### JWT Token Structure
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "COMPLIANCE_OFFICER",
  "companyId": "company-id",
  "iat": 1694567890,
  "exp": 1694654290
}
```

### Role-Based Access Control
- **ADMIN**: Full access to all endpoints
- **COMPLIANCE_OFFICER**: Access to all vendor and assessment management
- **PROCUREMENT_MANAGER**: Access to vendor management and basic assessments

### Request Headers
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

## Rate Limiting

### Authentication Endpoints
- **POST /api/auth/register**: 5 requests per hour per IP
- **POST /api/auth/login**: 10 requests per hour per IP
- **POST /api/auth/verify-email**: 3 requests per hour per IP

### General API Endpoints
- **All other endpoints**: 100 requests per hour per user

## API Versioning

### Current Version
- **Base URL**: `/api/v1/` (optional for initial implementation)
- **Content-Type**: `application/json`
- **Accept**: `application/json`

### Future Considerations
- Version header support for future API changes
- Backward compatibility for at least one major version
- Deprecation notices in response headers
