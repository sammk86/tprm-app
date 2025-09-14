import { AssessmentCategory } from '@/types'

export interface AssessmentTemplateData {
  name: string
  description: string
  category: AssessmentCategory
  questions: {
    sections: Array<{
      title: string
      questions: Array<{
        id: string
        text: string
        type: 'yesno' | 'select' | 'multiselect' | 'text' | 'number' | 'date'
        options?: string[]
        required: boolean
      }>
    }>
  }
  riskWeights: {
    sections: Record<string, number>
    questions: Record<string, number>
  }
}

export const defaultTemplates: AssessmentTemplateData[] = [
  {
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
            {
              id: 'q3',
              text: 'What is your annual revenue?',
              type: 'select',
              options: ['Less than $1M', '$1M-$10M', '$10M-$50M', '$50M-$100M', 'More than $100M'],
              required: true,
            },
          ],
        },
        {
          title: 'Financial Stability',
          questions: [
            {
              id: 'q4',
              text: 'Do you have adequate financial resources to fulfill this contract?',
              type: 'yesno',
              required: true,
            },
            {
              id: 'q5',
              text: 'Have you filed for bankruptcy in the past 5 years?',
              type: 'yesno',
              required: true,
            },
            {
              id: 'q6',
              text: 'Do you have professional liability insurance?',
              type: 'yesno',
              required: true,
            },
          ],
        },
        {
          title: 'Security and Compliance',
          questions: [
            {
              id: 'q7',
              text: 'Do you have a formal information security program?',
              type: 'yesno',
              required: true,
            },
            {
              id: 'q8',
              text: 'Are you certified to any security standards?',
              type: 'multiselect',
              options: ['ISO 27001', 'SOC 2', 'PCI DSS', 'HIPAA', 'None'],
              required: false,
            },
            {
              id: 'q9',
              text: 'Do you conduct regular security awareness training?',
              type: 'yesno',
              required: true,
            },
          ],
        },
        {
          title: 'Operational Capabilities',
          questions: [
            {
              id: 'q10',
              text: 'Do you have business continuity and disaster recovery plans?',
              type: 'yesno',
              required: true,
            },
            {
              id: 'q11',
              text: 'What is your average response time for support requests?',
              type: 'select',
              options: ['Same day', '1-2 business days', '3-5 business days', 'More than 5 business days'],
              required: true,
            },
            {
              id: 'q12',
              text: 'Do you have 24/7 support available?',
              type: 'yesno',
              required: false,
            },
          ],
        },
      ],
    },
    riskWeights: {
      sections: {
        'Company Information': 0.15,
        'Financial Stability': 0.25,
        'Security and Compliance': 0.35,
        'Operational Capabilities': 0.25,
      },
      questions: {
        q1: 0.05,
        q2: 0.05,
        q3: 0.05,
        q4: 0.10,
        q5: 0.10,
        q6: 0.05,
        q7: 0.15,
        q8: 0.10,
        q9: 0.10,
        q10: 0.10,
        q11: 0.10,
        q12: 0.05,
      },
    },
  },
  {
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
            {
              id: 'q4',
              text: 'How often do you perform security assessments?',
              type: 'select',
              options: ['Monthly', 'Quarterly', 'Annually', 'As needed', 'Never'],
              required: true,
            },
          ],
        },
        {
          title: 'Data Protection',
          questions: [
            {
              id: 'q5',
              text: 'How do you encrypt data at rest?',
              type: 'select',
              options: ['AES-256', 'AES-128', 'Other encryption', 'No encryption'],
              required: true,
            },
            {
              id: 'q6',
              text: 'Do you have data backup and recovery procedures?',
              type: 'yesno',
              required: true,
            },
            {
              id: 'q7',
              text: 'Do you have data classification policies?',
              type: 'yesno',
              required: true,
            },
            {
              id: 'q8',
              text: 'How do you handle data retention and disposal?',
              type: 'select',
              options: ['Automated with policies', 'Manual process', 'Ad-hoc', 'No formal process'],
              required: true,
            },
          ],
        },
        {
          title: 'Network Security',
          questions: [
            {
              id: 'q9',
              text: 'Do you use firewalls and intrusion detection systems?',
              type: 'yesno',
              required: true,
            },
            {
              id: 'q10',
              text: 'Do you have network segmentation in place?',
              type: 'yesno',
              required: true,
            },
            {
              id: 'q11',
              text: 'How do you monitor network traffic?',
              type: 'select',
              options: ['24/7 monitoring', 'Business hours only', 'On-demand', 'No monitoring'],
              required: true,
            },
          ],
        },
      ],
    },
    riskWeights: {
      sections: {
        'Security Controls': 0.40,
        'Data Protection': 0.35,
        'Network Security': 0.25,
      },
      questions: {
        q1: 0.10,
        q2: 0.10,
        q3: 0.10,
        q4: 0.10,
        q5: 0.15,
        q6: 0.10,
        q7: 0.05,
        q8: 0.05,
        q9: 0.10,
        q10: 0.10,
        q11: 0.05,
      },
    },
  },
  {
    name: 'Financial Stability Assessment',
    description: 'Assessment focused on financial health and stability',
    category: 'FINANCIAL',
    questions: {
      sections: [
        {
          title: 'Financial Health',
          questions: [
            {
              id: 'q1',
              text: 'What is your current credit rating?',
              type: 'select',
              options: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'Below B', 'Not rated'],
              required: true,
            },
            {
              id: 'q2',
              text: 'Do you have audited financial statements?',
              type: 'yesno',
              required: true,
            },
            {
              id: 'q3',
              text: 'What is your debt-to-equity ratio?',
              type: 'select',
              options: ['Less than 0.5', '0.5-1.0', '1.0-2.0', '2.0-3.0', 'More than 3.0', 'Unknown'],
              required: true,
            },
            {
              id: 'q4',
              text: 'Do you have sufficient working capital?',
              type: 'yesno',
              required: true,
            },
          ],
        },
        {
          title: 'Insurance Coverage',
          questions: [
            {
              id: 'q5',
              text: 'Do you have general liability insurance?',
              type: 'yesno',
              required: true,
            },
            {
              id: 'q6',
              text: 'Do you have professional liability insurance?',
              type: 'yesno',
              required: true,
            },
            {
              id: 'q7',
              text: 'What is your insurance coverage limit?',
              type: 'select',
              options: ['Less than $1M', '$1M-$5M', '$5M-$10M', 'More than $10M', 'Unknown'],
              required: true,
            },
          ],
        },
        {
          title: 'Business Continuity',
          questions: [
            {
              id: 'q8',
              text: 'Do you have business continuity plans?',
              type: 'yesno',
              required: true,
            },
            {
              id: 'q9',
              text: 'Do you have key person insurance?',
              type: 'yesno',
              required: false,
            },
            {
              id: 'q10',
              text: 'How long can you operate without revenue?',
              type: 'select',
              options: ['Less than 1 month', '1-3 months', '3-6 months', '6-12 months', 'More than 12 months'],
              required: true,
            },
          ],
        },
      ],
    },
    riskWeights: {
      sections: {
        'Financial Health': 0.50,
        'Insurance Coverage': 0.30,
        'Business Continuity': 0.20,
      },
      questions: {
        q1: 0.15,
        q2: 0.15,
        q3: 0.10,
        q4: 0.10,
        q5: 0.10,
        q6: 0.10,
        q7: 0.10,
        q8: 0.10,
        q9: 0.05,
        q10: 0.05,
      },
    },
  },
]

export function getTemplateById(id: string): AssessmentTemplateData | undefined {
  return defaultTemplates.find(template => template.name === id)
}

export function getTemplatesByCategory(category: AssessmentCategory): AssessmentTemplateData[] {
  return defaultTemplates.filter(template => template.category === category)
}

export function getAllTemplates(): AssessmentTemplateData[] {
  return defaultTemplates
}
