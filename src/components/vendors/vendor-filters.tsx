'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown,
  Building2,
  Shield,
  DollarSign,
  Users
} from 'lucide-react'

interface VendorFiltersProps {
  onFiltersChange: (filters: VendorFilters) => void
  onSearchChange: (search: string) => void
  searchValue: string
  filters: VendorFilters
}

export interface VendorFilters {
  status: string[]
  vendorType: string[]
  riskLevel: string[]
  businessCriticality: string[]
  tags: string[]
}

const filterOptions = {
  status: [
    { value: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'INACTIVE', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
    { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'SUSPENDED', label: 'Suspended', color: 'bg-red-100 text-red-800' },
  ],
  vendorType: [
    { value: 'TECHNOLOGY', label: 'Technology', icon: Building2 },
    { value: 'CONSULTING', label: 'Consulting', icon: Users },
    { value: 'SECURITY', label: 'Security', icon: Shield },
    { value: 'FINANCIAL', label: 'Financial', icon: DollarSign },
  ],
  riskLevel: [
    { value: 'LOW', label: 'Low Risk', color: 'bg-green-100 text-green-800' },
    { value: 'MEDIUM', label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'HIGH', label: 'High Risk', color: 'bg-orange-100 text-orange-800' },
    { value: 'CRITICAL', label: 'Critical Risk', color: 'bg-red-100 text-red-800' },
  ],
  businessCriticality: [
    { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' },
  ],
}

export function VendorFilters({ onFiltersChange, onSearchChange, searchValue, filters }: VendorFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterToggle = (category: keyof VendorFilters, value: string) => {
    const currentValues = filters[category]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    onFiltersChange({
      ...filters,
      [category]: newValues,
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      vendorType: [],
      riskLevel: [],
      businessCriticality: [],
      tags: [],
    })
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((total, filterArray) => total + filterArray.length, 0)
  }

  const renderFilterGroup = (
    category: keyof VendorFilters,
    title: string,
    options: Array<{ value: string; label: string; color?: string; icon?: any }>
  ) => {
    const activeFilters = filters[category]
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isActive = activeFilters.includes(option.value)
            const Icon = option.icon
            
            return (
              <button
                key={option.value}
                onClick={() => handleFilterToggle(category, option.value)}
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? option.color || 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {Icon && <Icon className="h-3 w-3" />}
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <div className="flex items-center space-x-2">
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFilterCount()} active
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-1" />
              {isExpanded ? 'Collapse' : 'Expand'}
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.status.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status.length}
              <button
                onClick={() => handleFilterToggle('status', filters.status[0])}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.riskLevel.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Risk: {filters.riskLevel.length}
              <button
                onClick={() => handleFilterToggle('riskLevel', filters.riskLevel[0])}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {renderFilterGroup('status', 'Status', filterOptions.status)}
            {renderFilterGroup('vendorType', 'Vendor Type', filterOptions.vendorType)}
            {renderFilterGroup('riskLevel', 'Risk Level', filterOptions.riskLevel)}
            {renderFilterGroup('businessCriticality', 'Business Criticality', filterOptions.businessCriticality)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
