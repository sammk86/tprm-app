import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create a test company
  const company = await prisma.company.upsert({
    where: { id: 'company-1' },
    update: {},
    create: {
      id: 'company-1',
      name: 'Acme Corporation',
      domain: 'acme.com',
      industry: 'Technology',
      size: 'MEDIUM',
      address: '123 Tech Street, San Francisco, CA 94105',
      phone: '+1-555-0123',
      website: 'https://acme.com',
    },
  })

  console.log('✅ Company created:', company.name)

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      email: 'admin@acme.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isEmailVerified: true,
      companyId: company.id,
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create compliance officer
  const complianceUser = await prisma.user.upsert({
    where: { email: 'compliance@acme.com' },
    update: {},
    create: {
      email: 'compliance@acme.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Chen',
      role: 'COMPLIANCE_OFFICER',
      isEmailVerified: true,
      companyId: company.id,
    },
  })

  console.log('✅ Compliance officer created:', complianceUser.email)

  // Create procurement manager
  const procurementUser = await prisma.user.upsert({
    where: { email: 'procurement@acme.com' },
    update: {},
    create: {
      email: 'procurement@acme.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Rodriguez',
      role: 'PROCUREMENT_MANAGER',
      isEmailVerified: true,
      companyId: company.id,
    },
  })

  console.log('✅ Procurement manager created:', procurementUser.email)

  // Create default assessment templates
  const { defaultTemplates } = await import('../src/lib/assessment-templates')

  for (const templateData of defaultTemplates) {
    const templateId = `template-${templateData.name.toLowerCase().replace(/\s+/g, '-')}`
    
    await prisma.assessmentTemplate.upsert({
      where: { id: templateId },
      update: {},
      create: {
        id: templateId,
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        questions: templateData.questions,
        riskWeights: templateData.riskWeights,
        createdById: adminUser.id,
      },
    })
  }

  console.log('✅ Default assessment templates created')

  // Create sample vendors
  const vendor1 = await prisma.vendor.upsert({
    where: { id: 'vendor-1' },
    update: {},
    create: {
      id: 'vendor-1',
      name: 'Tech Solutions Inc',
      contactEmail: 'contact@techsolutions.com',
      contactPhone: '+1-555-0100',
      website: 'https://techsolutions.com',
      address: '456 Innovation Drive, Austin, TX 78701',
      description: 'Leading provider of cloud infrastructure services',
      services: ['Cloud Hosting', 'Data Analytics', 'DevOps Consulting'],
      vendorType: 'TECHNOLOGY',
      riskLevel: 'MEDIUM',
      businessCriticality: 'HIGH',
      status: 'ACTIVE',
      companyId: company.id,
      createdById: procurementUser.id,
    },
  })

  const vendor2 = await prisma.vendor.upsert({
    where: { id: 'vendor-2' },
    update: {},
    create: {
      id: 'vendor-2',
      name: 'Financial Partners LLC',
      contactEmail: 'partners@financialpartners.com',
      contactPhone: '+1-555-0200',
      website: 'https://financialpartners.com',
      address: '789 Wall Street, New York, NY 10005',
      description: 'Financial advisory and investment services',
      services: ['Investment Advisory', 'Financial Planning', 'Risk Management'],
      vendorType: 'FINANCIAL',
      riskLevel: 'LOW',
      businessCriticality: 'MEDIUM',
      status: 'ACTIVE',
      companyId: company.id,
      createdById: procurementUser.id,
    },
  })

  console.log('✅ Sample vendors created')

  // Create sample assessment
  const generalTemplate = await prisma.assessmentTemplate.findFirst({
    where: { name: 'General Vendor Risk Assessment' },
  })

  if (generalTemplate) {
    const assessment = await prisma.assessment.upsert({
      where: { id: 'assessment-1' },
      update: {},
      create: {
        id: 'assessment-1',
        vendorId: vendor1.id,
        templateId: generalTemplate.id,
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        assignedToId: complianceUser.id,
        createdById: adminUser.id,
      },
    })

    console.log('✅ Sample assessment created')
  }

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
