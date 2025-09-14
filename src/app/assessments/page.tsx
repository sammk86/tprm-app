'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
        // In a real app, these would be API calls
        // For now, we'll use mock data
        setAssessments([
          {
            id: '1',
            vendorName: 'Acme Corp',
            templateName: 'General Risk Assessment',
            status: 'IN_PROGRESS',
            dueDate: '2025-09-20',
            assignedTo: 'John Smith',
            riskScore: 45,
            createdAt: '2025-09-13',
            updatedAt: '2025-09-13',
          },
          {
            id: '2',
            vendorName: 'Tech Solutions Inc',
            templateName: 'Cybersecurity Assessment',
            status: 'COMPLETED',
            dueDate: '2025-09-15',
            assignedTo: 'Jane Doe',
            riskScore: 25,
            createdAt: '2025-09-10',
            updatedAt: '2025-09-15',
          },
          {
            id: '3',
            vendorName: 'Global Services Ltd',
            templateName: 'Financial Assessment',
            status: 'REVIEWED',
            dueDate: '2025-09-18',
            assignedTo: 'Mike Johnson',
            riskScore: 75,
            createdAt: '2025-09-12',
            updatedAt: '2025-09-18',
          },
          {
            id: '4',
            vendorName: 'Data Systems Co',
            templateName: 'General Risk Assessment',
            status: 'DRAFT',
            dueDate: '2025-09-25',
            assignedTo: 'Sarah Wilson',
            createdAt: '2025-09-13',
            updatedAt: '2025-09-13',
          },
        ])

        setVendors([
          { id: '1', name: 'Acme Corp' },
          { id: '2', name: 'Tech Solutions Inc' },
          { id: '3', name: 'Global Services Ltd' },
          { id: '4', name: 'Data Systems Co' },
        ])

        setTemplates([
          { id: '1', name: 'General Risk Assessment', category: 'GENERAL' },
          { id: '2', name: 'Cybersecurity Assessment', category: 'CYBERSECURITY' },
          { id: '3', name: 'Financial Assessment', category: 'FINANCIAL' },
        ])

        setUsers([
          { id: '1', firstName: 'John', lastName: 'Smith', email: 'john@example.com' },
          { id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
          { id: '3', firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com' },
          { id: '4', firstName: 'Sarah', lastName: 'Wilson', email: 'sarah@example.com' },
        ])
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
    <div className="space-y-6">
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
  )
}
