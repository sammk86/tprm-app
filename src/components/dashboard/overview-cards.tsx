'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Users,
  Shield,
  Clock
} from 'lucide-react'

interface OverviewCardsProps {
  stats: {
    totalVendors: number
    activeAssessments: number
    highRiskVendors: number
    completedAssessments: number
    pendingReviews: number
    totalUsers: number
    securityIncidents: number
    avgResponseTime: number
  }
}

export function OverviewCards({ stats }: OverviewCardsProps) {
  const cards = [
    {
      title: 'Total Vendors',
      value: stats.totalVendors,
      icon: Building2,
      description: 'Registered vendors',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Active Assessments',
      value: stats.activeAssessments,
      icon: FileText,
      description: 'In progress',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'High Risk Vendors',
      value: stats.highRiskVendors,
      icon: AlertTriangle,
      description: 'Require attention',
      trend: '-3%',
      trendUp: false,
      variant: 'destructive' as const,
    },
    {
      title: 'Completed Assessments',
      value: stats.completedAssessments,
      icon: CheckCircle,
      description: 'This month',
      trend: '+15%',
      trendUp: true,
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: Clock,
      description: 'Awaiting approval',
      trend: '+5%',
      trendUp: false,
      variant: 'warning' as const,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: 'Platform users',
      trend: '+20%',
      trendUp: true,
    },
    {
      title: 'Security Incidents',
      value: stats.securityIncidents,
      icon: Shield,
      description: 'This quarter',
      trend: '-10%',
      trendUp: true,
      variant: 'success' as const,
    },
    {
      title: 'Avg Response Time',
      value: `${stats.avgResponseTime}h`,
      icon: TrendingUp,
      description: 'Assessment completion',
      trend: '-2h',
      trendUp: true,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{card.description}</span>
                <Badge 
                  variant={card.variant || (card.trendUp ? 'success' : 'warning')}
                  className="text-xs"
                >
                  {card.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
