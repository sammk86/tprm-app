'use client'

import { useState } from 'react'
import { Vendor } from '@/types'
import VendorCard from './VendorCard'
import { Search, Filter, Plus, Grid, List } from 'lucide-react'

interface VendorListProps {
  vendors: Vendor[]
  onEdit?: (vendor: Vendor) => void
  onDelete?: (vendor: Vendor) => void
  onView?: (vendor: Vendor) => void
  onCreate?: () => void
  isLoading?: boolean
}

interface FilterState {
  search: string
  status: string
  riskLevel: string
  vendorType: string
}

export default function VendorList({ 
  vendors, 
  onEdit, 
  onDelete, 
  onView, 
  onCreate, 
  isLoading = false 
}: VendorListProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    riskLevel: '',
    vendorType: '',
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = !filters.search || 
      vendor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      vendor.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      vendor.contactEmail?.toLowerCase().includes(filters.search.toLowerCase())

    const matchesStatus = !filters.status || vendor.status === filters.status
    const matchesRiskLevel = !filters.riskLevel || vendor.riskLevel === filters.riskLevel
    const matchesVendorType = !filters.vendorType || vendor.vendorType === filters.vendorType

    return matchesSearch && matchesStatus && matchesRiskLevel && matchesVendorType
  })

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      riskLevel: '',
      vendorType: '',
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Vendors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Vendors</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
          </button>
          {onCreate && (
            <button
              onClick={onCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Level
                </label>
                <select
                  value={filters.riskLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Risk Levels</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Type
                </label>
                <select
                  value={filters.vendorType}
                  onChange={(e) => setFilters(prev => ({ ...prev, vendorType: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="GENERAL">General</option>
                  <option value="TECHNOLOGY">Technology</option>
                  <option value="FINANCIAL">Financial</option>
                  <option value="HEALTHCARE">Healthcare</option>
                  <option value="LEGAL">Legal</option>
                  <option value="CONSULTING">Consulting</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredVendors.length} of {vendors.length} vendors
        </p>
      </div>

      {/* Vendor Grid/List */}
      {filteredVendors.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Search className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {hasActiveFilters 
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating a new vendor.'
            }
          </p>
          {onCreate && (
            <div className="mt-6">
              <button
                onClick={onCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
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
