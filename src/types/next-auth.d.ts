import { UserRole } from './index'
import { Company } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      companyId: string
      company: Company
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    companyId: string
    company: Company
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    companyId: string
    company: Company
  }
}
