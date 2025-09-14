'use client'

import { Vendor } from '@/types'
// Badge component will be defined inline
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

interface VendorCardProps {
  vendor: Vendor
  onEdit?: (vendor: Vendor) => void
  onDelete?: (vendor: Vendor) => void
  onView?: (vendor: Vendor) => void
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'INACTIVE':
      return <Clock className="h-4 w-4 text-gray-500" />
    case 'UNDER_REVIEW':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'TERMINATED':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800'
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800'
    case 'UNDER_REVIEW':
      return 'bg-yellow-100 text-yellow-800'
    case 'TERMINATED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getRiskLevelColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'LOW':
      return 'bg-green-100 text-green-800'
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800'
    case 'HIGH':
      return 'bg-orange-100 text-orange-800'
    case 'CRITICAL':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function VendorCard({ vendor, onEdit, onDelete, onView }: VendorCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{vendor.vendorType.toLowerCase()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(vendor.status)}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vendor.status)}`}>
            {vendor.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {vendor.contactEmail && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <span>{vendor.contactEmail}</span>
          </div>
        )}
        {vendor.contactPhone && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{vendor.contactPhone}</span>
          </div>
        )}
        {vendor.website && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Globe className="h-4 w-4" />
            <a 
              href={vendor.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              {vendor.website}
            </a>
          </div>
        )}
        {vendor.address && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{vendor.address}</span>
          </div>
        )}
      </div>

      {vendor.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{vendor.description}</p>
      )}

      {vendor.services && vendor.services.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {vendor.services.slice(0, 3).map((service, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                {service}
              </span>
            ))}
            {vendor.services.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                +{vendor.services.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(vendor.riskLevel)}`}>
            Risk: {vendor.riskLevel}
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {vendor.businessCriticality} Priority
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {onView && (
            <button
              onClick={() => onView(vendor)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(vendor)}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(vendor)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
