import { AssessmentCategory } from '@/types'

export interface RiskWeights {
  sections: Record<string, number>
  questions: Record<string, number>
}

export interface AssessmentResponses {
  [questionId: string]: any
}

export interface Question {
  id: string
  text: string
  type: 'yesno' | 'select' | 'multiselect' | 'text' | 'number' | 'date'
  options?: string[]
  required: boolean
}

export interface QuestionSection {
  title: string
  questions: Question[]
}

export interface AssessmentTemplate {
  sections: QuestionSection[]
}

/**
 * Calculate risk score based on responses and weights
 */
export function calculateRiskScore(
  responses: AssessmentResponses,
  weights: RiskWeights
): number {
  let totalScore = 0
  let totalWeight = 0

  // Calculate score for each question
  Object.keys(responses).forEach(questionId => {
    const response = responses[questionId]
    const weight = weights.questions[questionId] || 0

    if (weight > 0) {
      const questionScore = calculateQuestionScore(questionId, response)
      totalScore += questionScore * weight
      totalWeight += weight
    }
  })

  // Normalize score to 0-100 range
  if (totalWeight > 0) {
    return Math.round((totalScore / totalWeight) * 100)
  }

  return 0
}

/**
 * Calculate score for a single question based on response
 */
function calculateQuestionScore(questionId: string, response: any): number {
  // Default scoring logic - can be customized per question type
  if (response === null || response === undefined || response === '') {
    return 50 // Neutral score for empty responses
  }

  // Yes/No questions
  if (typeof response === 'boolean') {
    return response ? 20 : 80 // True = low risk (20), False = high risk (80)
  }

  // Select questions - score based on option selection
  if (typeof response === 'string') {
    return calculateSelectQuestionScore(questionId, response)
  }

  // Multi-select questions - score based on selections
  if (Array.isArray(response)) {
    return calculateMultiSelectQuestionScore(questionId, response)
  }

  // Number questions - score based on value ranges
  if (typeof response === 'number') {
    return calculateNumberQuestionScore(questionId, response)
  }

  // Default neutral score
  return 50
}

/**
 * Calculate score for select questions
 */
function calculateSelectQuestionScore(questionId: string, response: string): number {
  // Define scoring rules for specific questions
  const scoringRules: Record<string, Record<string, number>> = {
    // Company Information questions
    'q1': { // How long in business
      'Less than 1 year': 80,
      '1-3 years': 60,
      '3-5 years': 40,
      '5-10 years': 20,
      'More than 10 years': 10,
    },
    'q2': { // Company size
      '1-10': 70,
      '11-50': 50,
      '51-200': 30,
      '201-1000': 20,
      'More than 1000': 10,
    },
    'q3': { // Annual revenue
      'Less than $1M': 80,
      '$1M-$10M': 60,
      '$10M-$50M': 40,
      '$50M-$100M': 20,
      'More than $100M': 10,
    },
    // Financial questions
    'q4': { // Financial resources
      'Yes': 20,
      'No': 80,
    },
    'q5': { // Bankruptcy history
      'Yes': 90,
      'No': 20,
    },
    'q6': { // Insurance coverage
      'Yes': 20,
      'No': 80,
    },
    // Security questions
    'q7': { // Security program
      'Yes': 20,
      'No': 80,
    },
    'q8': { // Security certifications
      'Yes': 20,
      'No': 80,
    },
    'q9': { // Security training
      'Yes': 20,
      'No': 80,
    },
    // Data protection questions
    'q5_encryption': { // Encryption at rest
      'AES-256': 10,
      'AES-128': 20,
      'Other encryption': 40,
      'No encryption': 90,
    },
    'q6_backup': { // Data backup
      'Yes': 20,
      'No': 80,
    },
    // Network security questions
    'q9_network': { // Firewalls and IDS
      'Yes': 20,
      'No': 80,
    },
    'q10_network': { // Network segmentation
      'Yes': 20,
      'No': 60,
    },
    'q11_network': { // Network monitoring
      '24/7 monitoring': 10,
      'Business hours only': 40,
      'On-demand': 60,
      'No monitoring': 90,
    },
    // Financial health questions
    'q1_financial': { // Credit rating
      'AAA': 5,
      'AA': 10,
      'A': 20,
      'BBB': 40,
      'BB': 60,
      'B': 80,
      'Below B': 95,
      'Not rated': 70,
    },
    'q2_financial': { // Audited statements
      'Yes': 20,
      'No': 80,
    },
    'q3_financial': { // Debt-to-equity ratio
      'Less than 0.5': 10,
      '0.5-1.0': 20,
      '1.0-2.0': 40,
      '2.0-3.0': 60,
      'More than 3.0': 90,
      'Unknown': 70,
    },
    'q4_financial': { // Working capital
      'Yes': 20,
      'No': 80,
    },
    // Insurance questions
    'q5_insurance': { // General liability
      'Yes': 20,
      'No': 80,
    },
    'q6_insurance': { // Professional liability
      'Yes': 20,
      'No': 80,
    },
    'q7_insurance': { // Coverage limit
      'Less than $1M': 60,
      '$1M-$5M': 40,
      '$5M-$10M': 20,
      'More than $10M': 10,
      'Unknown': 70,
    },
    // Business continuity questions
    'q8_continuity': { // Business continuity plans
      'Yes': 20,
      'No': 80,
    },
    'q9_continuity': { // Key person insurance
      'Yes': 20,
      'No': 50,
    },
    'q10_continuity': { // Operating without revenue
      'Less than 1 month': 90,
      '1-3 months': 70,
      '3-6 months': 50,
      '6-12 months': 30,
      'More than 12 months': 10,
    },
  }

  const rules = scoringRules[questionId]
  if (rules && rules[response] !== undefined) {
    return rules[response]
  }

  // Default scoring for unknown questions
  return 50
}

/**
 * Calculate score for multi-select questions
 */
function calculateMultiSelectQuestionScore(questionId: string, responses: string[]): number {
  // Define scoring rules for multi-select questions
  const scoringRules: Record<string, Record<string, number>> = {
    'q8': { // Security certifications
      'ISO 27001': 10,
      'SOC 2': 15,
      'PCI DSS': 20,
      'HIPAA': 25,
      'None': 80,
    },
  }

  const rules = scoringRules[questionId]
  if (rules) {
    // Calculate average score for all selections
    const scores = responses.map(response => rules[response] || 50)
    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }

  // Default scoring for unknown multi-select questions
  return 50
}

/**
 * Calculate score for number questions
 */
function calculateNumberQuestionScore(questionId: string, response: number): number {
  // Define scoring rules for number questions
  const scoringRules: Record<string, (value: number) => number> = {
    // Add specific number question scoring rules here
  }

  const rule = scoringRules[questionId]
  if (rule) {
    return rule(response)
  }

  // Default scoring for unknown number questions
  return 50
}

/**
 * Get risk level based on score
 */
export function getRiskLevel(score: number): string {
  if (score >= 0 && score <= 30) return 'LOW'
  if (score >= 31 && score <= 60) return 'MEDIUM'
  if (score >= 61 && score <= 80) return 'HIGH'
  if (score >= 81 && score <= 100) return 'CRITICAL'
  return 'UNKNOWN'
}

/**
 * Get risk level color for UI
 */
export function getRiskLevelColor(score: number): string {
  if (score >= 0 && score <= 30) return 'text-green-600 bg-green-100'
  if (score >= 31 && score <= 60) return 'text-yellow-600 bg-yellow-100'
  if (score >= 61 && score <= 80) return 'text-orange-600 bg-orange-100'
  if (score >= 81 && score <= 100) return 'text-red-600 bg-red-100'
  return 'text-gray-600 bg-gray-100'
}

/**
 * Validate assessment responses against template
 */
export function validateAssessmentResponses(
  responses: AssessmentResponses,
  template: AssessmentTemplate
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check all required questions are answered
  template.sections.forEach(section => {
    section.questions.forEach(question => {
      if (question.required) {
        const response = responses[question.id]
        if (response === null || response === undefined || response === '') {
          errors.push(`Required question "${question.text}" is not answered`)
        }
      }
    })
  })

  // Check response types match question types
  template.sections.forEach(section => {
    section.questions.forEach(question => {
      const response = responses[question.id]
      if (response !== null && response !== undefined && response !== '') {
        if (!validateResponseType(response, question)) {
          errors.push(`Invalid response type for question "${question.text}"`)
        }
      }
    })
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate response type matches question type
 */
function validateResponseType(response: any, question: Question): boolean {
  switch (question.type) {
    case 'yesno':
      return typeof response === 'boolean'
    case 'select':
      return typeof response === 'string' && 
             (!question.options || question.options.includes(response))
    case 'multiselect':
      return Array.isArray(response) && 
             (!question.options || response.every(r => question.options!.includes(r)))
    case 'text':
      return typeof response === 'string'
    case 'number':
      return typeof response === 'number' && !isNaN(response)
    case 'date':
      return typeof response === 'string' && !isNaN(Date.parse(response))
    default:
      return true
  }
}
