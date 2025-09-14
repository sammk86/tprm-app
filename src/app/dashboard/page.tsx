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
        // In a real app, these would be API calls
        // For now, we'll use mock data
        setStats({
          totalVendors: 156,
          activeAssessments: 23,
          highRiskVendors: 8,
          completedAssessments: 89,
          pendingReviews: 12,
          totalUsers: 45,
          securityIncidents: 2,
          avgResponseTime: 3.2,
        })

        setRiskDistribution({
          low: 45,
          medium: 32,
          high: 18,
          critical: 5,
        })

        setVendorStatus({
          active: 120,
          inactive: 15,
          pending: 18,
          suspended: 3,
        })

        setRecentAssessments([
          {
            id: '1',
            vendorName: 'Acme Corp',
            templateName: 'General Risk Assessment',
            status: 'IN_PROGRESS',
            dueDate: '2025-09-20',
            assignedTo: 'John Smith',
            riskScore: 45,
            createdAt: '2025-09-13',
            updatedAt: '2025-09-13',
          },
          {
            id: '2',
            vendorName: 'Tech Solutions Inc',
            templateName: 'Cybersecurity Assessment',
            status: 'COMPLETED',
            dueDate: '2025-09-15',
            assignedTo: 'Jane Doe',
            riskScore: 25,
            createdAt: '2025-09-10',
            updatedAt: '2025-09-15',
          },
          {
            id: '3',
            vendorName: 'Global Services Ltd',
            templateName: 'Financial Assessment',
            status: 'REVIEWED',
            dueDate: '2025-09-18',
            assignedTo: 'Mike Johnson',
            riskScore: 75,
            createdAt: '2025-09-12',
            updatedAt: '2025-09-18',
          },
          {
            id: '4',
            vendorName: 'Data Systems Co',
            templateName: 'General Risk Assessment',
            status: 'DRAFT',
            dueDate: '2025-09-25',
            assignedTo: 'Sarah Wilson',
            createdAt: '2025-09-13',
            updatedAt: '2025-09-13',
          },
        ])
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