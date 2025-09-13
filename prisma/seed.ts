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
  const generalTemplate = await prisma.assessmentTemplate.upsert({
    where: { id: 'template-general' },
    update: {},
    create: {
      id: 'template-general',
      name: 'General Vendor Risk Assessment',
      description: 'Comprehensive risk assessment covering all major risk categories',
      category: 'GENERAL',
      questions: {
        sections: [
          {
            title: 'Company Information',
            questions: [
              {
                id: 'q1',
                text: 'How long has your company been in business?',
                type: 'select',
                options: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', 'More than 10 years'],
                required: true,
              },
              {
                id: 'q2',
                text: 'What is your company size (number of employees)?',
                type: 'select',
                options: ['1-10', '11-50', '51-200', '201-1000', 'More than 1000'],
                required: true,
              },
            ],
          },
          {
            title: 'Financial Stability',
            questions: [
              {
                id: 'q3',
                text: 'Do you have adequate financial resources to fulfill this contract?',
                type: 'yesno',
                required: true,
              },
              {
                id: 'q4',
                text: 'Have you filed for bankruptcy in the past 5 years?',
                type: 'yesno',
                required: true,
              },
            ],
          },
          {
            title: 'Security and Compliance',
            questions: [
              {
                id: 'q5',
                text: 'Do you have a formal information security program?',
                type: 'yesno',
                required: true,
              },
              {
                id: 'q6',
                text: 'Are you certified to any security standards?',
                type: 'multiselect',
                options: ['ISO 27001', 'SOC 2', 'PCI DSS', 'HIPAA', 'None'],
                required: false,
              },
            ],
          },
        ],
      },
      riskWeights: {
        sections: {
          'Company Information': 0.2,
          'Financial Stability': 0.3,
          'Security and Compliance': 0.5,
        },
        questions: {
          q1: 0.1,
          q2: 0.1,
          q3: 0.2,
          q4: 0.1,
          q5: 0.3,
          q6: 0.2,
        },
      },
      createdById: adminUser.id,
    },
  })

  console.log('✅ General assessment template created')

  const cybersecurityTemplate = await prisma.assessmentTemplate.upsert({
    where: { id: 'template-cybersecurity' },
    update: {},
    create: {
      id: 'template-cybersecurity',
      name: 'Cybersecurity Assessment',
      description: 'Focused assessment on cybersecurity controls and practices',
      category: 'CYBERSECURITY',
      questions: {
        sections: [
          {
            title: 'Security Controls',
            questions: [
              {
                id: 'q1',
                text: 'Do you have multi-factor authentication enabled for all systems?',
                type: 'yesno',
                required: true,
              },
              {
                id: 'q2',
                text: 'Do you conduct regular security awareness training?',
                type: 'yesno',
                required: true,
              },
              {
                id: 'q3',
                text: 'Do you have an incident response plan?',
                type: 'yesno',
                required: true,
              },
            ],
          },
          {
            title: 'Data Protection',
            questions: [
              {
                id: 'q4',
                text: 'How do you encrypt data at rest?',
                type: 'select',
                options: ['AES-256', 'AES-128', 'Other encryption', 'No encryption'],
                required: true,
              },
              {
                id: 'q5',
                text: 'Do you have data backup and recovery procedures?',
                type: 'yesno',
                required: true,
              },
            ],
          },
        ],
      },
      riskWeights: {
        sections: {
          'Security Controls': 0.6,
          'Data Protection': 0.4,
        },
        questions: {
          q1: 0.2,
          q2: 0.2,
          q3: 0.2,
          q4: 0.2,
          q5: 0.2,
        },
      },
      createdById: adminUser.id,
    },
  })

  console.log('✅ Cybersecurity assessment template created')

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
