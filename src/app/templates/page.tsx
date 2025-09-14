'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { TemplateList } from '@/components/templates/template-list'
import { TemplateForm } from '@/components/templates/template-form'
import { Loader2 } from 'lucide-react'
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

export default function TemplatesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    fetchTemplates()
  }, [status, router])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/assessment-templates')
      const data = await response.json()
      
      if (data.success) {
        const formattedTemplates = data.templates.map((template: AssessmentTemplateWithCreator) => ({
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          questions: template.questions,
          riskWeights: template.riskWeights,
          isActive: template.isActive,
          createdBy: {
            firstName: template.createdBy.firstName,
            lastName: template.createdBy.lastName,
            email: template.createdBy.email,
          },
          createdAt: template.createdAt.toString().split('T')[0],
          updatedAt: template.updatedAt.toString().split('T')[0],
        }))
        setTemplates(formattedTemplates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setShowForm(true)
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setShowForm(true)
  }

  const handleDelete = async (template: Template) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return
    }

    try {
      const response = await fetch(`/api/assessment-templates/${template.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (result.success) {
        setTemplates(prev => prev.filter(t => t.id !== template.id))
      } else {
        console.error('Failed to delete template:', result.error)
        alert('Failed to delete template. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Error deleting template. Please try again.')
    }
  }

  const handleView = (template: Template) => {
    router.push(`/templates/${template.id}`)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      const url = editingTemplate 
        ? `/api/assessment-templates/${editingTemplate.id}`
        : '/api/assessment-templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (result.success) {
        if (editingTemplate) {
          setTemplates(prev => prev.map(t => 
            t.id === editingTemplate.id ? { ...result.template, createdBy: editingTemplate.createdBy } : t
          ))
        } else {
          await fetchTemplates() // Refresh to get the new template with creator info
        }
        setShowForm(false)
        setEditingTemplate(null)
      } else {
        console.error('Failed to save template:', result.error)
        alert('Failed to save template. Please try again.')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Error saving template. Please try again.')
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTemplate(null)
  }

  const handleToggleActive = async (template: Template) => {
    try {
      const response = await fetch(`/api/assessment-templates/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...template,
          isActive: !template.isActive,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setTemplates(prev => prev.map(t => 
          t.id === template.id ? { ...t, isActive: !t.isActive } : t
        ))
      } else {
        console.error('Failed to update template:', result.error)
        alert('Failed to update template. Please try again.')
      }
    } catch (error) {
      console.error('Error updating template:', error)
      alert('Error updating template. Please try again.')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assessment Templates</h1>
          <p className="text-muted-foreground">
            Create and manage assessment templates for different types of vendor risk evaluations.
          </p>
        </div>

        <TemplateList
          templates={templates}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onCreate={handleCreate}
          onToggleActive={handleToggleActive}
          isLoading={loading}
        />

        <TemplateForm
          template={editingTemplate}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isOpen={showForm}
        />
      </div>
    </MainLayout>
  )
}
