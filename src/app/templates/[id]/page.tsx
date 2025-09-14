'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Copy, 
  FileText, 
  Shield, 
  Building, 
  DollarSign, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react'
import { AssessmentTemplateWithCreator } from '@/types'

export const dynamic = 'force-dynamic'

interface Template {
  id: string
  name: string
  description?: string
  category: string
  questions: any
  riskWeights: any
  isActive: boolean
  createdBy: {
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface Question {
  id: string
  text: string
  type: 'TEXT' | 'MULTIPLE_CHOICE' | 'YES_NO' | 'RATING' | 'NUMBER'
  required: boolean
  options?: string[]
  riskWeight: number
  section?: string
}

const categoryIcons: Record<string, any> = {
  GENERAL: FileText,
  CYBERSECURITY: Shield,
  FINANCIAL: DollarSign,
  OPERATIONAL: Settings,
  COMPLIANCE: Building,
  REPUTATIONAL: AlertTriangle,
}

const categoryColors: Record<string, string> = {
  GENERAL: 'bg-blue-100 text-blue-800',
  CYBERSECURITY: 'bg-red-100 text-red-800',
  FINANCIAL: 'bg-green-100 text-green-800',
  OPERATIONAL: 'bg-yellow-100 text-yellow-800',
  COMPLIANCE: 'bg-purple-100 text-purple-800',
  REPUTATIONAL: 'bg-orange-100 text-orange-800',
}

const questionTypes = [
  { value: 'TEXT', label: 'Text Input' },
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'YES_NO', label: 'Yes/No' },
  { value: 'RATING', label: 'Rating (1-5)' },
  { value: 'NUMBER', label: 'Number' },
]

export default function TemplateDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    fetchTemplate()
  }, [status, router, params.id])

  const fetchTemplate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/assessment-templates/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        const templateData: Template = {
          id: data.template.id,
          name: data.template.name,
          description: data.template.description,
          category: data.template.category,
          questions: data.template.questions,
          riskWeights: data.template.riskWeights,
          isActive: data.template.isActive,
          createdBy: {
            firstName: data.template.createdBy.firstName,
            lastName: data.template.createdBy.lastName,
            email: data.template.createdBy.email,
          },
          createdAt: data.template.createdAt.toString().split('T')[0],
          updatedAt: data.template.updatedAt.toString().split('T')[0],
        }
        
        setTemplate(templateData)

        // Parse questions
        if (templateData.questions) {
          if (Array.isArray(templateData.questions)) {
            setQuestions(templateData.questions)
          } else if (typeof templateData.questions === 'object') {
            const parsedQuestions = Object.entries(templateData.questions).map(([id, q]: [string, any]) => ({
              id,
              text: q.text || q.question || '',
              type: q.type || 'TEXT',
              required: q.required ?? true,
              options: q.options || [],
              riskWeight: q.riskWeight || 1,
              section: q.section || '',
            }))
            setQuestions(parsedQuestions)
          }
        }
      } else {
        console.error('Failed to fetch template:', data.error)
        router.push('/templates')
      }
    } catch (error) {
      console.error('Error fetching template:', error)
      router.push('/templates')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/templates/${params.id}/edit`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/assessment-templates/${params.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (result.success) {
        router.push('/templates')
      } else {
        console.error('Failed to delete template:', result.error)
        alert('Failed to delete template. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Error deleting template. Please try again.')
    }
  }

  const handleDuplicate = async () => {
    if (!template) return

    const duplicateName = `${template.name} (Copy)`
    
    try {
      const response = await fetch('/api/assessment-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: duplicateName,
          description: template.description,
          category: template.category,
          questions: template.questions,
          riskWeights: template.riskWeights,
          isActive: false, // Start duplicates as inactive
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        router.push(`/templates/${result.template.id}`)
      } else {
        console.error('Failed to duplicate template:', result.error)
        alert('Failed to duplicate template. Please try again.')
      }
    } catch (error) {
      console.error('Error duplicating template:', error)
      alert('Error duplicating template. Please try again.')
    }
  }

  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || !template) {
    return null
  }

  const CategoryIcon = categoryIcons[template.category] || FileText
  const totalQuestions = questions.length
  const requiredQuestions = questions.filter(q => q.required).length
  const avgRiskWeight = totalQuestions > 0 
    ? questions.reduce((sum, q) => sum + q.riskWeight, 0) / totalQuestions 
    : 0

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/templates')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${categoryColors[template.category]}`}>
                <CategoryIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{template.name}</h1>
                <p className="text-muted-foreground">Assessment Template Details</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={togglePreview}>
              {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Template Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <div className="mt-1">
                  <Badge variant="secondary" className={categoryColors[template.category]}>
                    {template.category.charAt(0) + template.category.slice(1).toLowerCase()}
                  </Badge>
                </div>
              </div>
              
              {template.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm text-foreground">{template.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Created By</label>
                <div className="mt-1">
                  <p className="text-sm font-medium text-foreground">
                    {template.createdBy.firstName} {template.createdBy.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{template.createdBy.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="mt-1 text-sm text-foreground">{template.createdAt}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="mt-1 text-sm text-foreground">{template.updatedAt}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Template Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{totalQuestions}</div>
                  <div className="text-sm text-muted-foreground">Total Questions</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{requiredQuestions}</div>
                  <div className="text-sm text-muted-foreground">Required</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{avgRiskWeight.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Avg Risk Weight</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(questions.map(q => q.section).filter(Boolean)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Sections</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Questions ({totalQuestions})</CardTitle>
            <CardDescription>
              Review the questions that will be used in assessments with this template
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No questions configured</h3>
                <p className="text-muted-foreground">
                  This template doesn't have any questions yet. Edit the template to add questions.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {(() => {
                  const sections = questions.reduce((acc, question) => {
                    const section = question.section || 'General'
                    if (!acc[section]) {
                      acc[section] = []
                    }
                    acc[section].push(question)
                    return acc
                  }, {} as Record<string, Question[]>)
                  
                  return Object.entries(sections).map(([sectionName, sectionQuestions]) => (
                    <div key={sectionName} className="space-y-4">
                      {sectionName !== 'General' && (
                        <div>
                          <h4 className="text-lg font-semibold text-foreground mb-2">{sectionName}</h4>
                          <div className="h-[1px] w-full bg-border" />
                        </div>
                      )}
                      <div className="space-y-4">
                        {sectionQuestions.map((question: Question, questionIndex: number) => {
                          const questionType = questionTypes.find(t => t.value === question.type)
                          return (
                            <div key={question.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    Q{questionIndex + 1}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {questionType?.label || question.type}
                                  </Badge>
                                  {question.required && (
                                    <Badge variant="secondary" className="text-xs">
                                      Required
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    Risk Weight: {question.riskWeight}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-sm font-medium text-foreground mb-2">
                                {question.text}
                              </p>
                              
                              {question.options && question.options.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Options:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {question.options.map((option: string, optionIndex: number) => (
                                      <Badge key={optionIndex} variant="outline" className="text-xs">
                                        {option}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {showPreview && (
                                <div className="mt-4 p-3 bg-muted rounded border-l-4 border-primary">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
                                  {question.type === 'TEXT' && (
                                    <input 
                                      type="text" 
                                      placeholder="Text input..." 
                                      className="w-full px-3 py-2 border border-input rounded text-sm" 
                                      disabled 
                                    />
                                  )}
                                  {question.type === 'MULTIPLE_CHOICE' && question.options && (
                                    <div className="space-y-2">
                                      {question.options.map((option: string, idx: number) => (
                                        <label key={idx} className="flex items-center gap-2">
                                          <input type="radio" name={`preview_${question.id}`} disabled />
                                          <span className="text-sm">{option}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                  {question.type === 'YES_NO' && (
                                    <div className="flex gap-4">
                                      <label className="flex items-center gap-2">
                                        <input type="radio" name={`preview_${question.id}`} disabled />
                                        <span className="text-sm">Yes</span>
                                      </label>
                                      <label className="flex items-center gap-2">
                                        <input type="radio" name={`preview_${question.id}`} disabled />
                                        <span className="text-sm">No</span>
                                      </label>
                                    </div>
                                  )}
                                  {question.type === 'RATING' && (
                                    <div className="flex gap-2">
                                      {[1, 2, 3, 4, 5].map(rating => (
                                        <label key={rating} className="flex items-center gap-1">
                                          <input type="radio" name={`preview_${question.id}`} disabled />
                                          <span className="text-sm">{rating}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                  {question.type === 'NUMBER' && (
                                    <input 
                                      type="number" 
                                      placeholder="Number input..." 
                                      className="w-full px-3 py-2 border border-input rounded text-sm" 
                                      disabled 
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
