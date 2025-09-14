'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  FileText,
  Shield,
  Building,
  DollarSign,
  Settings,
  AlertTriangle,
  MoreHorizontal,
  Power
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

interface TemplateListProps {
  templates: Template[]
  onEdit: (template: Template) => void
  onDelete: (template: Template) => void
  onView: (template: Template) => void
  onCreate: () => void
  onToggleActive: (template: Template) => void
  isLoading: boolean
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

export function TemplateList({
  templates,
  onEdit,
  onDelete,
  onView,
  onCreate,
  onToggleActive,
  isLoading
}: TemplateListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const categories = ['GENERAL', 'CYBERSECURITY', 'FINANCIAL', 'OPERATIONAL', 'COMPLIANCE', 'REPUTATIONAL']

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && template.isActive) ||
                         (selectedStatus === 'inactive' && !template.isActive)

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getQuestionCount = (questions: any): number => {
    if (Array.isArray(questions)) {
      return questions.length
    }
    if (typeof questions === 'object' && questions !== null) {
      return Object.keys(questions).length
    }
    return 0
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded"></div>
        <div className="h-64 bg-muted animate-pulse rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0) + category.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <Button onClick={onCreate} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Templates</CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground">
              {templates.length}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Templates</CardTitle>
            <CardDescription className="text-2xl font-bold text-green-600">
              {templates.filter(t => t.isActive).length}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
            <CardDescription className="text-2xl font-bold text-blue-600">
              {new Set(templates.map(t => t.category)).size}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Questions</CardTitle>
            <CardDescription className="text-2xl font-bold text-purple-600">
              {templates.length > 0 
                ? Math.round(templates.reduce((sum, t) => sum + getQuestionCount(t.questions), 0) / templates.length)
                : 0
              }
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Templates</CardTitle>
          <CardDescription>
            Showing {filteredTemplates.length} of {templates.length} templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                {templates.length === 0 
                  ? "Get started by creating your first assessment template."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {templates.length === 0 && (
                <Button onClick={onCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => {
                  const CategoryIcon = categoryIcons[template.category] || FileText
                  const questionCount = getQuestionCount(template.questions)
                  
                  return (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${categoryColors[template.category] || 'bg-gray-100 text-gray-800'}`}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{template.name}</div>
                            {template.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {template.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={categoryColors[template.category]}>
                          {template.category.charAt(0) + template.category.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{questionCount}</div>
                          <div className="text-muted-foreground">questions</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {template.createdBy.firstName} {template.createdBy.lastName}
                          </div>
                          <div className="text-muted-foreground">{template.createdBy.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {template.updatedAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(template)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(template)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onToggleActive(template)}
                            className="h-8 w-8"
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(template)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
