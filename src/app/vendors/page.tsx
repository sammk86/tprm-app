'use client'

import { useState, useEffect } from 'react'
import { Vendor, CreateVendorData } from '@/types'
import VendorList from '@/components/vendors/VendorList'
import VendorForm from '@/components/vendors/VendorForm'
import { MainLayout } from '@/components/layout/main-layout'
import { Dialog } from '@headlessui/react'

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/vendors')
      const data = await response.json()
      
      if (data.success) {
        setVendors(data.vendors)
      } else {
        console.error('Failed to fetch vendors:', data.error)
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  // Create vendor
  const handleCreateVendor = async (data: CreateVendorData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (result.success) {
        setVendors(prev => [result.vendor, ...prev])
        setShowForm(false)
      } else {
        console.error('Failed to create vendor:', result.error)
        alert('Failed to create vendor. Please try again.')
      }
    } catch (error) {
      console.error('Error creating vendor:', error)
      alert('Error creating vendor. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update vendor
  const handleUpdateVendor = async (data: CreateVendorData) => {
    if (!editingVendor) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/vendors/${editingVendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (result.success) {
        setVendors(prev => 
          prev.map(vendor => 
            vendor.id === editingVendor.id ? result.vendor : vendor
          )
        )
        setEditingVendor(null)
        setShowForm(false)
      } else {
        console.error('Failed to update vendor:', result.error)
        alert('Failed to update vendor. Please try again.')
      }
    } catch (error) {
      console.error('Error updating vendor:', error)
      alert('Error updating vendor. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete vendor
  const handleDeleteVendor = async (vendor: Vendor) => {
    if (!confirm(`Are you sure you want to delete ${vendor.name}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (result.success) {
        setVendors(prev => prev.filter(v => v.id !== vendor.id))
      } else {
        console.error('Failed to delete vendor:', result.error)
        alert('Failed to delete vendor. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting vendor:', error)
      alert('Error deleting vendor. Please try again.')
    }
  }

  // Handle form actions
  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setShowForm(true)
  }

  const handleViewVendor = (vendor: Vendor) => {
    // TODO: Implement vendor detail view
    console.log('View vendor:', vendor)
  }

  const handleCreateNew = () => {
    setEditingVendor(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingVendor(null)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendors</h1>
          <p className="text-muted-foreground">
            Manage your third-party vendors and their risk assessments.
          </p>
        </div>

        <VendorList
          vendors={vendors}
          onEdit={handleEditVendor}
          onDelete={handleDeleteVendor}
          onView={handleViewVendor}
          onCreate={handleCreateNew}
          isLoading={isLoading}
        />

        {/* Vendor Form Modal */}
        <Dialog open={showForm} onClose={handleCloseForm} className="relative z-50">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-6">
                  {editingVendor ? 'Edit Vendor' : 'Create New Vendor'}
                </Dialog.Title>
                
                <VendorForm
                  vendor={editingVendor || undefined}
                  onSubmit={editingVendor ? handleUpdateVendor : handleCreateVendor}
                  onCancel={handleCloseForm}
                  isLoading={isSubmitting}
                />
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </div>
    </MainLayout>
  )
}
