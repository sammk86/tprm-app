'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  FileText, 
  Shield, 
  Building, 
  DollarSign, 
  Settings, 
  AlertTriangle,
  GripVertical,
  HelpCircle
} from 'lucide-react'

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

interface TemplateFormProps {
  template: Template | null
  onSubmit: (data: any) => void
  onCancel: () => void
  isOpen: boolean
}

const categories = [
  { value: 'GENERAL', label: 'General', icon: FileText },
  { value: 'CYBERSECURITY', label: 'Cybersecurity', icon: Shield },
  { value: 'FINANCIAL', label: 'Financial', icon: DollarSign },
  { value: 'OPERATIONAL', label: 'Operational', icon: Settings },
  { value: 'COMPLIANCE', label: 'Compliance', icon: Building },
  { value: 'REPUTATIONAL', label: 'Reputational', icon: AlertTriangle },
]

const questionTypes = [
  { value: 'TEXT', label: 'Text Input' },
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'YES_NO', label: 'Yes/No' },
  { value: 'RATING', label: 'Rating (1-5)' },
  { value: 'NUMBER', label: 'Number' },
]

export function TemplateForm({ template, onSubmit, onCancel, isOpen }: TemplateFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'GENERAL',
    isActive: true,
  })
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        category: template.category,
        isActive: template.isActive,
      })
      
      // Parse questions from template
      if (template.questions) {
        if (Array.isArray(template.questions)) {
          setQuestions(template.questions)
        } else if (typeof template.questions === 'object') {
          const parsedQuestions = Object.entries(template.questions).map(([id, q]: [string, any]) => ({
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
      // Reset form for new template
      setFormData({
        name: '',
        description: '',
        category: 'GENERAL',
        isActive: true,
      })
      setQuestions([])
    }
    setErrors({})
  }, [template, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required'
    }

    if (questions.length === 0) {
      newErrors.questions = 'At least one question is required'
    }

    questions.forEach((question, index) => {
      if (!question.text.trim()) {
        newErrors[`question_${index}_text`] = 'Question text is required'
      }
      if (question.type === 'MULTIPLE_CHOICE' && (!question.options || question.options.length < 2)) {
        newErrors[`question_${index}_options`] = 'Multiple choice questions need at least 2 options'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Group questions by section
      const questionsBySection = questions.reduce((acc, question) => {
        const section = question.section || 'General'
        if (!acc[section]) {
          acc[section] = []
        }
        acc[section].push(question)
        return acc
      }, {} as Record<string, Question[]>)

      // Map question types to API format
      const mapQuestionType = (type: string): 'yesno' | 'select' | 'multiselect' | 'text' | 'number' | 'date' => {
        switch (type) {
          case 'YES_NO': return 'yesno'
          case 'MULTIPLE_CHOICE': return 'select'
          case 'RATING': return 'number'
          case 'NUMBER': return 'number'
          case 'TEXT': 
          default: return 'text'
        }
      }

      // Format questions for API
      const sections = Object.entries(questionsBySection).map(([sectionTitle, sectionQuestions]) => ({
        title: sectionTitle,
        questions: sectionQuestions.map(q => ({
          id: q.id,
          text: q.text,
          type: mapQuestionType(q.type),
          options: q.options || [],
          required: q.required,
        })),
      }))

      // Format risk weights
      const sectionWeights = Object.keys(questionsBySection).reduce((acc, section) => {
        const sectionQuestions = questionsBySection[section]
        const avgWeight = sectionQuestions.reduce((sum, q) => sum + q.riskWeight, 0) / sectionQuestions.length
        acc[section] = avgWeight
        return acc
      }, {} as Record<string, number>)

      const questionWeights = questions.reduce((acc, question) => {
        acc[question.id] = question.riskWeight
        return acc
      }, {} as Record<string, number>)

      const submitData = {
        ...formData,
        questions: { sections },
        riskWeights: {
          sections: sectionWeights,
          questions: questionWeights,
        },
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Error submitting template:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addQuestion = () => {
    setEditingQuestion(null)
    setShowQuestionForm(true)
  }

  const editQuestion = (question: Question) => {
    setEditingQuestion(question)
    setShowQuestionForm(true)
  }

  const saveQuestion = (questionData: Partial<Question>) => {
    if (editingQuestion) {
      // Update existing question
      setQuestions(prev => prev.map(q => 
        q.id === editingQuestion.id ? { ...q, ...questionData } : q
      ))
    } else {
      // Add new question
      const newQuestion: Question = {
        id: `q_${Date.now()}`,
        text: questionData.text || '',
        type: questionData.type || 'TEXT',
        required: questionData.required ?? true,
        options: questionData.options || [],
        riskWeight: questionData.riskWeight || 1,
        section: questionData.section || '',
      }
      setQuestions(prev => [...prev, newQuestion])
    }
    setShowQuestionForm(false)
    setEditingQuestion(null)
  }

  const deleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId))
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Assessment Template' : 'Create Assessment Template'}
          </DialogTitle>
          <DialogDescription>
            Configure the assessment template with questions and risk weights for vendor evaluations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Template Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Cybersecurity Risk Assessment"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this template assesses..."
                  className="w-full px-3 py-2 border border-input rounded-md text-sm min-h-[80px] focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm focus:ring-2 focus:ring-ring focus:border-ring"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active (available for use in assessments)
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Assessment Questions</CardTitle>
                  <CardDescription>
                    Add questions that will be used to evaluate vendor risks
                  </CardDescription>
                </div>
                <Button type="button" onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {errors.questions && (
                <p className="text-red-500 text-sm mb-4">{errors.questions}</p>
              )}
              
              {questions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-muted-foreground rounded-lg">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No questions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add questions to create your assessment template.
                  </p>
                  <Button type="button" onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Question
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      index={index}
                      onEdit={editQuestion}
                      onDelete={deleteQuestion}
                      errors={errors}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {template ? 'Update Template' : 'Create Template'}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Question Form Modal */}
        {showQuestionForm && (
          <QuestionFormModal
            question={editingQuestion}
            onSave={saveQuestion}
            onCancel={() => {
              setShowQuestionForm(false)
              setEditingQuestion(null)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function QuestionCard({ 
  question, 
  index, 
  onEdit, 
  onDelete, 
  errors 
}: { 
  question: Question
  index: number
  onEdit: (question: Question) => void
  onDelete: (questionId: string) => void
  errors: Record<string, string>
}) {
  const questionType = questionTypes.find(t => t.value === question.type)
  
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Question {index + 1}
            </span>
            <Badge variant="outline">
              {questionType?.label || question.type}
            </Badge>
            {question.required && (
              <Badge variant="secondary" className="text-xs">
                Required
              </Badge>
            )}
          </div>
          
          <p className="text-sm font-medium text-foreground mb-1">
            {question.text}
          </p>
          
          {question.options && question.options.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Options: {question.options.join(', ')}
            </div>
          )}
          
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>Risk Weight: {question.riskWeight}</span>
            {question.section && <span>Section: {question.section}</span>}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(question)}
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(question.id)}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {errors[`question_${index}_text`] && (
        <p className="text-red-500 text-xs">{errors[`question_${index}_text`]}</p>
      )}
      {errors[`question_${index}_options`] && (
        <p className="text-red-500 text-xs">{errors[`question_${index}_options`]}</p>
      )}
    </div>
  )
}

function QuestionFormModal({ 
  question, 
  onSave, 
  onCancel 
}: { 
  question: Question | null
  onSave: (data: Partial<Question>) => void
  onCancel: () => void
}) {
  const [questionData, setQuestionData] = useState({
    text: question?.text || '',
    type: question?.type || 'TEXT',
    required: question?.required ?? true,
    options: question?.options || [''],
    riskWeight: question?.riskWeight || 1,
    section: question?.section || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const cleanedOptions = questionData.options.filter(opt => opt.trim())
    
    onSave({
      ...questionData,
      options: cleanedOptions,
    })
  }

  const addOption = () => {
    setQuestionData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const updateOption = (index: number, value: string) => {
    setQuestionData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  const removeOption = (index: number) => {
    setQuestionData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {question ? 'Edit Question' : 'Add Question'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Question Text *</label>
            <textarea
              value={questionData.text}
              onChange={(e) => setQuestionData(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Enter your question..."
              className="w-full px-3 py-2 border border-input rounded-md text-sm min-h-[80px]"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Question Type</label>
            <select
              value={questionData.type}
              onChange={(e) => setQuestionData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
            >
              {questionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {questionData.type === 'MULTIPLE_CHOICE' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Options</label>
              <div className="space-y-2">
                {questionData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Risk Weight</label>
            <Input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={questionData.riskWeight}
              onChange={(e) => setQuestionData(prev => ({ ...prev, riskWeight: parseFloat(e.target.value) || 1 }))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Higher weights have more impact on risk score calculation
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Section (Optional)</label>
            <Input
              value={questionData.section}
              onChange={(e) => setQuestionData(prev => ({ ...prev, section: e.target.value }))}
              placeholder="e.g., Data Security, Operations"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="required"
              checked={questionData.required}
              onChange={(e) => setQuestionData(prev => ({ ...prev, required: e.target.checked }))}
            />
            <label htmlFor="required" className="text-sm">
              Required question
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {question ? 'Update' : 'Add'} Question
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
