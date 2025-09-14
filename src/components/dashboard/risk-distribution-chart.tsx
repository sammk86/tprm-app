'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RiskDistributionData {
  low: number
  medium: number
  high: number
  critical: number
}

interface RiskDistributionChartProps {
  data: RiskDistributionData
}

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  const total = data.low + data.medium + data.high + data.critical
  
  const riskLevels = [
    { level: 'Low', count: data.low, color: 'bg-green-500', textColor: 'text-green-700' },
    { level: 'Medium', count: data.medium, color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    { level: 'High', count: data.high, color: 'bg-orange-500', textColor: 'text-orange-700' },
    { level: 'Critical', count: data.critical, color: 'bg-red-500', textColor: 'text-red-700' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {riskLevels.map(({ level, count, color, textColor }) => {
            const percentage = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-sm font-medium">{level}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{count}</span>
                    <Badge variant="outline" className="text-xs">
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
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
            <p>No risk data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
