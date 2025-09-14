'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface VendorStatusData {
  active: number
  inactive: number
  pending: number
  suspended: number
}

interface VendorStatusChartProps {
  data: VendorStatusData
}

export function VendorStatusChart({ data }: VendorStatusChartProps) {
  const total = data.active + data.inactive + data.pending + data.suspended
  
  const statuses = [
    { 
      status: 'Active', 
      count: data.active, 
      color: 'bg-green-500', 
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      status: 'Inactive', 
      count: data.inactive, 
      color: 'bg-gray-500', 
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    { 
      status: 'Pending', 
      count: data.pending, 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    { 
      status: 'Suspended', 
      count: data.suspended, 
      color: 'bg-red-500', 
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statuses.map(({ status, count, color, textColor, bgColor, borderColor }) => {
            const percentage = total > 0 ? (count / total) * 100 : 0
            return (
              <div 
                key={status} 
                className={`p-4 rounded-lg border ${bgColor} ${borderColor}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className={`text-sm font-medium ${textColor}`}>
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${textColor}`}>
                      {count}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-white/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        
        {total === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No vendor data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
