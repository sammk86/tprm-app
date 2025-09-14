'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Calendar, User, FileText } from 'lucide-react'

interface AssessmentFormData {
  vendorId: string
  templateId: string
  dueDate: string
  assignedToId: string
}

interface AssessmentFormProps {
  assessment?: any
  vendors: Array<{ id: string; name: string }>
  templates: Array<{ id: string; name: string; category: string }>
  users: Array<{ id: string; firstName: string; lastName: string; email: string }>
  onSubmit: (data: AssessmentFormData) => void
  onCancel: () => void
  isOpen: boolean
}

export function AssessmentForm({
  assessment,
  vendors,
  templates,
  users,
  onSubmit,
  onCancel,
  isOpen
}: AssessmentFormProps) {
  const [formData, setFormData] = useState<AssessmentFormData>({
    vendorId: '',
    templateId: '',
    dueDate: '',
    assignedToId: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (assessment) {
      setFormData({
        vendorId: assessment.vendorId || '',
        templateId: assessment.templateId || '',
        dueDate: assessment.dueDate ? new Date(assessment.dueDate).toISOString().split('T')[0] : '',
        assignedToId: assessment.assignedToId || '',
      })
    } else {
      setFormData({
        vendorId: '',
        templateId: '',
        dueDate: '',
        assignedToId: '',
      })
    }
  }, [assessment, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.vendorId || !formData.templateId || !formData.dueDate) {
        setError('Please fill in all required fields')
        return
      }

      // Validate due date is in the future
      const dueDate = new Date(formData.dueDate)
      if (dueDate <= new Date()) {
        setError('Due date must be in the future')
        return
      }

      await onSubmit(formData)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {assessment ? 'Edit Assessment' : 'Create New Assessment'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="vendorId" className="text-sm font-medium text-foreground">
                Vendor *
              </label>
              <select
                id="vendorId"
                name="vendorId"
                value={formData.vendorId}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:ring-ring focus:border-ring"
              >
                <option value="">Select a vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="templateId" className="text-sm font-medium text-foreground">
                Assessment Template *
              </label>
              <select
                id="templateId"
                name="templateId"
                value={formData.templateId}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:ring-ring focus:border-ring"
              >
                <option value="">Select a template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-medium text-foreground">
                Due Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="assignedToId" className="text-sm font-medium text-foreground">
                Assign To
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  id="assignedToId"
                  name="assignedToId"
                  value={formData.assignedToId}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full border border-input rounded-md px-3 py-2 pl-10 text-sm focus:ring-ring focus:border-ring"
                >
                  <option value="">Select an assignee (optional)</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {assessment ? 'Update Assessment' : 'Create Assessment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
