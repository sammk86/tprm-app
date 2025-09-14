'use client'

import { useState } from 'react'
import { Vendor } from '@/types'
import VendorCard from './VendorCard'
import { VendorFilters, VendorFilters as VendorFiltersType } from './vendor-filters'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Grid, List, Download, Search } from 'lucide-react'

interface EnhancedVendorListProps {
  vendors: Vendor[]
  onEdit?: (vendor: Vendor) => void
  onDelete?: (vendor: Vendor) => void
  onView?: (vendor: Vendor) => void
  onCreate?: () => void
  isLoading?: boolean
}

export default function EnhancedVendorList({ 
  vendors, 
  onEdit, 
  onDelete, 
  onView, 
  onCreate, 
  isLoading = false 
}: EnhancedVendorListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<VendorFiltersType>({
    status: [],
    vendorType: [],
    riskLevel: [],
    businessCriticality: [],
    tags: [],
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredVendors = vendors.filter(vendor => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false // tags not available in current Vendor type

    // Status filter
    const matchesStatus = filters.status.length === 0 || filters.status.includes(vendor.status)

    // Vendor type filter
    const matchesVendorType = filters.vendorType.length === 0 || filters.vendorType.includes(vendor.vendorType)

    // Risk level filter
    const matchesRiskLevel = filters.riskLevel.length === 0 || filters.riskLevel.includes(vendor.riskLevel)

    // Business criticality filter
    const matchesBusinessCriticality = filters.businessCriticality.length === 0 || 
      filters.businessCriticality.includes(vendor.businessCriticality)

    return matchesSearch && matchesStatus && matchesVendorType && matchesRiskLevel && matchesBusinessCriticality
  })

  const handleExport = () => {
    // In a real app, this would export the filtered vendors to CSV/Excel
    console.log('Exporting vendors:', filteredVendors)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Vendors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg shadow-sm border border-border p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
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
          <h1 className="text-3xl font-bold text-foreground">Vendor Management</h1>
          <p className="text-muted-foreground">
            Manage your third-party vendors and their risk assessments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <VendorFilters
        onFiltersChange={setFilters}
        onSearchChange={setSearchTerm}
        searchValue={searchTerm}
        filters={filters}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Vendor Grid/List */}
      {filteredVendors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No vendors found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || Object.values(filters).some(f => f.length > 0)
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating a new vendor.'
              }
            </p>
            {onCreate && (
              <Button onClick={onCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  )
}
