'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { AssessmentList } from '@/components/assessments/assessment-list'
import { AssessmentForm } from '@/components/assessments/assessment-form'
import { Loader2 } from 'lucide-react'

interface Assessment {
  id: string
  vendorName: string
  templateName: string
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED' | 'APPROVED' | 'REJECTED'
  dueDate: string
  assignedTo: string
  riskScore?: number
  createdAt: string
  updatedAt: string
}

interface Vendor {
  id: string
  name: string
}

interface Template {
  id: string
  name: string
  category: string
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

export default function AssessmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    // Fetch data
    const fetchData = async () => {
      try {
        // Fetch assessments from API
        const assessmentsResponse = await fetch('/api/assessments')
        const assessmentsData = await assessmentsResponse.json()
        
        if (assessmentsData.success) {
          const formattedAssessments = assessmentsData.assessments.map((assessment: any) => ({
            id: assessment.id,
            vendorName: assessment.vendor?.name || 'Unknown Vendor',
            templateName: assessment.template?.name || 'Unknown Template',
            status: assessment.status,
            dueDate: assessment.dueDate ? assessment.dueDate.split('T')[0] : '',
            assignedTo: assessment.assignedTo ? `${assessment.assignedTo.firstName} ${assessment.assignedTo.lastName}` : 'Unassigned',
            riskScore: assessment.riskScore,
            createdAt: assessment.createdAt.split('T')[0],
            updatedAt: assessment.updatedAt.split('T')[0],
          }))
          setAssessments(formattedAssessments)
        }

        // Fetch vendors from API
        const vendorsResponse = await fetch('/api/vendors')
        const vendorsData = await vendorsResponse.json()
        
        if (vendorsData.success) {
          setVendors(vendorsData.vendors)
        }

        // Fetch templates from API
        const templatesResponse = await fetch('/api/assessment-templates')
        const templatesData = await templatesResponse.json()
        
        if (templatesData.success) {
          setTemplates(templatesData.templates)
        }

        // TODO: Fetch users from API when users endpoint is available
        setUsers([])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [status, router])

  const handleCreate = () => {
    setEditingAssessment(null)
    setShowForm(true)
  }

  const handleEdit = (assessment: Assessment) => {
    setEditingAssessment(assessment)
    setShowForm(true)
  }

  const handleDelete = (assessment: Assessment) => {
    if (confirm('Are you sure you want to delete this assessment?')) {
      setAssessments(prev => prev.filter(a => a.id !== assessment.id))
    }
  }

  const handleView = (assessment: Assessment) => {
    // Navigate to assessment detail page
    router.push(`/assessments/${assessment.id}`)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingAssessment) {
        // Update existing assessment
        setAssessments(prev => prev.map(a => 
          a.id === editingAssessment.id 
            ? { ...a, ...data, updatedAt: new Date().toISOString().split('T')[0] }
            : a
        ))
      } else {
        // Create new assessment
        const newAssessment: Assessment = {
          id: Date.now().toString(),
          vendorName: vendors.find(v => v.id === data.vendorId)?.name || '',
          templateName: templates.find(t => t.id === data.templateId)?.name || '',
          status: 'DRAFT',
          dueDate: data.dueDate,
          assignedTo: users.find(u => u.id === data.assignedToId)?.firstName + ' ' + users.find(u => u.id === data.assignedToId)?.lastName || '',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        }
        setAssessments(prev => [newAssessment, ...prev])
      }
      setShowForm(false)
      setEditingAssessment(null)
    } catch (error) {
      console.error('Error saving assessment:', error)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingAssessment(null)
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
          <h1 className="text-3xl font-bold text-foreground">Assessments</h1>
          <p className="text-muted-foreground">
            Manage vendor risk assessments and track their progress.
          </p>
        </div>

        <AssessmentList
          assessments={assessments}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onCreate={handleCreate}
          isLoading={loading}
        />

        <AssessmentForm
          assessment={editingAssessment}
          vendors={vendors}
          templates={templates}
          users={users}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isOpen={showForm}
        />
      </div>
    </MainLayout>
  )
}
