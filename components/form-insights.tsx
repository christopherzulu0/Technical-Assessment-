'use client'

import { TrendingUp, Users, Clock, Zap, Eye, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface FormInsight {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
}

interface FormInsightsProps {
  insights?: FormInsight[]
}

export function FormInsights({ insights = [] }: FormInsightsProps) {
  const defaultInsights: FormInsight[] = [
    {
      label: 'Total Responses',
      value: 1234,
      change: 12,
      trend: 'up',
      icon: <Users className='w-5 h-5 text-blue-600' />,
    },
    {
      label: 'Avg. Response Time',
      value: '3m 24s',
      change: -8,
      trend: 'up',
      icon: <Clock className='w-5 h-5 text-purple-600' />,
    },
    {
      label: 'Completion Rate',
      value: '87%',
      change: 5,
      trend: 'up',
      icon: <CheckCircle className='w-5 h-5 text-green-600' />,
    },
    {
      label: 'Page Views',
      value: '5.2K',
      change: 18,
      trend: 'up',
      icon: <Eye className='w-5 h-5 text-indigo-600' />,
    },
  ]

  const displayInsights = insights.length > 0 ? insights : defaultInsights

  return (
    <div className='space-y-6'>
      {/* Main Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {displayInsights.map((insight, index) => (
          <Card key={index} className='border-border/50 hover:shadow-md transition-shadow'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center'>
                  {insight.icon}
                </div>
                {insight.change !== undefined && (
                  <Badge
                    variant='outline'
                    className={`text-xs ${
                      insight.trend === 'up'
                        ? 'bg-green-500/10 text-green-700 border-green-200'
                        : 'bg-red-500/10 text-red-700 border-red-200'
                    }`}
                  >
                    <TrendingUp className='w-3 h-3 mr-1' />
                    {insight.change}%
                  </Badge>
                )}
              </div>
              <p className='text-2xl font-bold text-foreground'>{insight.value}</p>
              <p className='text-xs text-muted-foreground mt-2'>{insight.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Field Performance */}
      <Card className='border-border/50'>
        <CardHeader>
          <CardTitle>Field Performance</CardTitle>
          <CardDescription>
            See which fields have the highest completion rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[
              { name: 'Full Name', completion: 98, attempts: 1234 },
              { name: 'Email', completion: 95, attempts: 1170 },
              { name: 'Phone', completion: 87, attempts: 1070 },
              { name: 'Message', completion: 72, attempts: 890 },
              { name: 'Attachment', completion: 45, attempts: 556 },
            ].map((field) => (
              <div key={field.name} className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-foreground'>{field.name}</span>
                  <span className='text-xs text-muted-foreground'>
                    {field.completion}% ({field.attempts} attempts)
                  </span>
                </div>
                <div className='h-2 bg-muted rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-primary to-primary/60 transition-all'
                    style={{ width: `${field.completion}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drop-off Analysis */}
      <Card className='border-border/50'>
        <CardHeader>
          <CardTitle>Drop-off Analysis</CardTitle>
          <CardDescription>
            See where users are leaving your form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {[
              { page: 'Page 1 (Name, Email)', dropOff: 5, users: 1234 },
              { page: 'Page 2 (Contact)', dropOff: 12, users: 1170 },
              { page: 'Page 3 (Message)', dropOff: 25, users: 1030 },
            ].map((item) => (
              <div key={item.page} className='p-3 rounded-lg bg-muted/30 border border-border/50'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='font-medium text-sm text-foreground'>{item.page}</span>
                  <Badge
                    variant='outline'
                    className={`text-xs ${
                      item.dropOff > 20
                        ? 'bg-red-500/10 text-red-700 border-red-200'
                        : 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
                    }`}
                  >
                    {item.dropOff}% drop-off
                  </Badge>
                </div>
                <p className='text-xs text-muted-foreground'>
                  {item.users} users completed this page
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Device & Source Analytics */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Devices */}
        <Card className='border-border/50'>
          <CardHeader>
            <CardTitle className='text-base'>Devices</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {[
              { device: 'Desktop', percentage: 65, count: 810 },
              { device: 'Mobile', percentage: 30, count: 375 },
              { device: 'Tablet', percentage: 5, count: 49 },
            ].map((item) => (
              <div key={item.device} className='space-y-1'>
                <div className='flex justify-between text-sm'>
                  <span className='text-foreground font-medium'>{item.device}</span>
                  <span className='text-muted-foreground'>{item.percentage}%</span>
                </div>
                <div className='h-1.5 bg-muted rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-primary'
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Traffic Source */}
        <Card className='border-border/50'>
          <CardHeader>
            <CardTitle className='text-base'>Traffic Source</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {[
              { source: 'Direct', percentage: 45, count: 556 },
              { source: 'Email', percentage: 35, count: 432 },
              { source: 'Social Media', percentage: 15, count: 184 },
              { source: 'Other', percentage: 5, count: 62 },
            ].map((item) => (
              <div key={item.source} className='space-y-1'>
                <div className='flex justify-between text-sm'>
                  <span className='text-foreground font-medium'>{item.source}</span>
                  <span className='text-muted-foreground'>{item.percentage}%</span>
                </div>
                <div className='h-1.5 bg-muted rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-primary/70'
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
