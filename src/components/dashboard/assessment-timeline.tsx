'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface AssessmentTimelineItem {
  id: string
  vendorName: string
  templateName: string
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED' | 'APPROVED' | 'REJECTED'
  dueDate: string
  assignedTo: string
  riskScore?: number
}

interface AssessmentTimelineProps {
  assessments: AssessmentTimelineItem[]
}

export function AssessmentTimeline({ assessments }: AssessmentTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return 'success' as const
      case 'IN_PROGRESS':
        return 'info' as const
      case 'REJECTED':
        return 'destructive' as const
      case 'DRAFT':
        return 'secondary' as const
      default:
        return 'default' as const
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Assessments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assessments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No assessments found</p>
            </div>
          ) : (
            assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(assessment.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {assessment.vendorName}
                    </h4>
                    <Badge variant={getStatusVariant(assessment.status)}>
                      {assessment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {assessment.templateName}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-muted-foreground">
                      Due: {formatDate(assessment.dueDate)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Assigned to: {assessment.assignedTo}
                    </span>
                    {assessment.riskScore && (
                      <span className="text-xs text-muted-foreground">
                        Risk Score: {assessment.riskScore}
                      </span>
                    )}
                  </div>
                  {isOverdue(assessment.dueDate) && assessment.status !== 'COMPLETED' && (
                    <Badge variant="destructive" className="mt-2 text-xs">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
