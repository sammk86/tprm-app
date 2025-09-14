'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

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

interface AssessmentListProps {
  assessments: Assessment[]
  onEdit?: (assessment: Assessment) => void
  onDelete?: (assessment: Assessment) => void
  onView?: (assessment: Assessment) => void
  onCreate?: () => void
  isLoading?: boolean
}

interface FilterState {
  search: string
  status: string
  riskLevel: string
  assignedTo: string
}

export function AssessmentList({ 
  assessments, 
  onEdit, 
  onDelete, 
  onView, 
  onCreate, 
  isLoading = false 
}: AssessmentListProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    riskLevel: '',
    assignedTo: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = !filters.search || 
      assessment.vendorName.toLowerCase().includes(filters.search.toLowerCase()) ||
      assessment.templateName.toLowerCase().includes(filters.search.toLowerCase()) ||
      assessment.assignedTo.toLowerCase().includes(filters.search.toLowerCase())

    const matchesStatus = !filters.status || assessment.status === filters.status
    const matchesRiskLevel = !filters.riskLevel || 
      (assessment.riskScore && getRiskLevel(assessment.riskScore) === filters.riskLevel)
    const matchesAssignedTo = !filters.assignedTo || assessment.assignedTo === filters.assignedTo

    return matchesSearch && matchesStatus && matchesRiskLevel && matchesAssignedTo
  })

  const getRiskLevel = (score: number) => {
    if (score >= 0 && score <= 30) return 'LOW'
    if (score >= 31 && score <= 60) return 'MEDIUM'
    if (score >= 61 && score <= 80) return 'HIGH'
    if (score >= 81 && score <= 100) return 'CRITICAL'
    return 'UNKNOWN'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'REJECTED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
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

  const getRiskVariant = (score: number) => {
    if (score >= 0 && score <= 30) return 'success' as const
    if (score >= 31 && score <= 60) return 'info' as const
    if (score >= 61 && score <= 80) return 'warning' as const
    if (score >= 81 && score <= 100) return 'destructive' as const
    return 'default' as const
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

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      riskLevel: '',
      assignedTo: '',
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Assessments</h2>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg shadow-sm border border-border p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-48"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assessment Management</h1>
          <p className="text-muted-foreground">
            Manage and track vendor risk assessments
          </p>
        </div>
        {onCreate && (
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assessment
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {Object.values(filters).filter(v => v !== '').length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm focus:ring-ring focus:border-ring"
                  >
                    <option value="">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Risk Level
                  </label>
                  <select
                    value={filters.riskLevel}
                    onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm focus:ring-ring focus:border-ring"
                  >
                    <option value="">All Risk Levels</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Assigned To
                  </label>
                  <select
                    value={filters.assignedTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm focus:ring-ring focus:border-ring"
                  >
                    <option value="">All Assignees</option>
                    <option value="John Smith">John Smith</option>
                    <option value="Jane Doe">Jane Doe</option>
                    <option value="Mike Johnson">Mike Johnson</option>
                    <option value="Sarah Wilson">Sarah Wilson</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAssessments.length} of {assessments.length} assessments
        </p>
      </div>

      {/* Assessment List */}
      {filteredAssessments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No assessments found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating a new assessment.'
              }
            </p>
            {onCreate && (
              <Button onClick={onCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Assessment
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(assessment.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {assessment.vendorName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {assessment.templateName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusVariant(assessment.status)}>
                      {assessment.status.replace('_', ' ')}
                    </Badge>
                    {assessment.riskScore && (
                      <Badge variant={getRiskVariant(assessment.riskScore)}>
                        Risk: {assessment.riskScore}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {formatDate(assessment.dueDate)}</span>
                    {isOverdue(assessment.dueDate) && assessment.status !== 'COMPLETED' && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Assigned to: {assessment.assignedTo}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Created: {formatDate(assessment.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2">
                  {onView && (
                    <Button variant="outline" size="sm" onClick={() => onView(assessment)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  )}
                  {onEdit && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(assessment)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="outline" size="sm" onClick={() => onDelete(assessment)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
