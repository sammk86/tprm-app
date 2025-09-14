'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { OverviewCards } from '@/components/dashboard/overview-cards'
import { RiskDistributionChart } from '@/components/dashboard/risk-distribution-chart'
import { AssessmentTimeline } from '@/components/dashboard/assessment-timeline'
import { VendorStatusChart } from '@/components/dashboard/vendor-status-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { VendorWithRelations, AssessmentWithRelations } from '@/types'

export const dynamic = 'force-dynamic'

interface DashboardStats {
  totalVendors: number
  activeAssessments: number
  highRiskVendors: number
  completedAssessments: number
  pendingReviews: number
  totalUsers: number
  securityIncidents: number
  avgResponseTime: number
}

interface RiskDistribution {
  low: number
  medium: number
  high: number
  critical: number
}

interface VendorStatus {
  active: number
  inactive: number
  pending: number
  suspended: number
}

interface AssessmentItem {
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

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalVendors: 0,
    activeAssessments: 0,
    highRiskVendors: 0,
    completedAssessments: 0,
    pendingReviews: 0,
    totalUsers: 0,
    securityIncidents: 0,
    avgResponseTime: 0,
  })
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution>({
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  })
  const [vendorStatus, setVendorStatus] = useState<VendorStatus>({
    active: 0,
    inactive: 0,
    pending: 0,
    suspended: 0,
  })
  const [recentAssessments, setRecentAssessments] = useState<AssessmentItem[]>([])

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // Fetch vendors data
        const vendorsResponse = await fetch('/api/vendors')
        const vendorsData = await vendorsResponse.json()
        const vendors = vendorsData.success ? vendorsData.vendors : []

        // Fetch assessments data
        const assessmentsResponse = await fetch('/api/assessments')
        const assessmentsData = await assessmentsResponse.json()
        const assessments = assessmentsData.success ? assessmentsData.assessments : []

        // Calculate stats from real data
        const totalVendors = vendors.length
        const activeAssessments = assessments.filter((a: AssessmentWithRelations) => a.status === 'IN_PROGRESS').length
        const completedAssessments = assessments.filter((a: AssessmentWithRelations) => a.status === 'COMPLETED' || a.status === 'APPROVED').length
        const pendingReviews = assessments.filter((a: AssessmentWithRelations) => a.status === 'REVIEWED').length
        const highRiskVendors = vendors.filter((v: VendorWithRelations) => v.riskLevel === 'HIGH' || v.riskLevel === 'CRITICAL').length

        setStats({
          totalVendors,
          activeAssessments,
          highRiskVendors,
          completedAssessments,
          pendingReviews,
          totalUsers: 0, // TODO: Implement users API
          securityIncidents: 0, // TODO: Implement incidents tracking
          avgResponseTime: 0, // TODO: Implement response time tracking
        })

        // Calculate risk distribution from vendors
        const riskCounts = vendors.reduce((acc: { low: number; medium: number; high: number; critical: number }, vendor: VendorWithRelations) => {
          const riskLevel = vendor.riskLevel || 'LOW'
          switch (riskLevel) {
            case 'CRITICAL': acc.critical++; break
            case 'HIGH': acc.high++; break
            case 'MEDIUM': acc.medium++; break
            case 'LOW': acc.low++; break
            default: acc.low++; break
          }
          return acc
        }, { low: 0, medium: 0, high: 0, critical: 0 })

        setRiskDistribution(riskCounts)

        // Calculate vendor status distribution
        const statusCounts = vendors.reduce((acc: { active: number; inactive: number; pending: number; suspended: number }, vendor: VendorWithRelations) => {
          const status = vendor.status || 'ACTIVE'
          switch (status) {
            case 'ACTIVE': acc.active++; break
            case 'INACTIVE': acc.inactive++; break
            case 'UNDER_REVIEW': acc.pending++; break
            case 'TERMINATED': acc.suspended++; break
            default: acc.active++; break
          }
          return acc
        }, { active: 0, inactive: 0, pending: 0, suspended: 0 })

        setVendorStatus(statusCounts)

        // Set recent assessments (limit to 4 most recent)
        const recentAssessments = assessments
          .sort((a: AssessmentWithRelations, b: AssessmentWithRelations) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 4)
          .map((assessment: AssessmentWithRelations) => ({
            id: assessment.id,
            vendorName: assessment.vendor?.name || 'Unknown Vendor',
            templateName: assessment.template?.name || 'Unknown Template',
            status: assessment.status,
            dueDate: assessment.dueDate || '',
            assignedTo: assessment.assignedTo ? `${assessment.assignedTo.firstName} ${assessment.assignedTo.lastName}` : 'Unassigned',
            riskScore: assessment.riskScore,
            createdAt: assessment.createdAt.toString().split('T')[0],
            updatedAt: assessment.updatedAt.toString().split('T')[0],
          }))

        setRecentAssessments(recentAssessments)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [status, router])

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
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user?.name || 'User'}! Here&apos;s an overview of your TPRM platform.
          </p>
        </div>

        <OverviewCards stats={stats} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RiskDistributionChart data={riskDistribution} />
          <VendorStatusChart data={vendorStatus} />
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="font-medium">Add New Vendor</div>
                <div className="text-sm text-muted-foreground">Register a new vendor for assessment</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="font-medium">Create Assessment</div>
                <div className="text-sm text-muted-foreground">Start a new risk assessment</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="font-medium">View Reports</div>
                <div className="text-sm text-muted-foreground">Generate risk reports</div>
              </button>
            </CardContent>
          </Card>
        </div>

        <AssessmentTimeline assessments={recentAssessments} />
      </div>
    </MainLayout>
  )
}
