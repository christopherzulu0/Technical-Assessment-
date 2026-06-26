'use client'

import { TrendingUp, Target, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FormAdvancedAnalyticsProps {
  totalSubmissions: number
  completionRate?: number
  averageTime?: number
}

export function FormAdvancedAnalytics({
  totalSubmissions,
  completionRate = 85,
  averageTime = 3.5,
}: FormAdvancedAnalyticsProps) {
  const metrics = [
    {
      icon: Target,
      title: 'Completion Rate',
      value: `${completionRate}%`,
      description: 'Forms started and completed',
      bgColor: 'bg-primary/5',
      color: 'text-primary',
    },
    {
      icon: TrendingUp,
      title: 'Total Responses',
      value: totalSubmissions.toString(),
      description: 'Submissions collected',
      bgColor: 'bg-blue-500/5',
      color: 'text-blue-600',
    },
    {
      icon: CheckCircle2,
      title: 'Success Rate',
      value: '98%',
      description: 'Forms processed successfully',
      bgColor: 'bg-green-500/5',
      color: 'text-green-600',
    },
    {
      icon: Clock,
      title: 'Avg. Time',
      value: `${averageTime}m`,
      description: 'Average completion time',
      bgColor: 'bg-purple-500/5',
      color: 'text-purple-600',
    },
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {metrics.map((metric) => (
        <Card key={metric.title} className='border-border/50 shadow-sm hover:shadow-md transition-shadow'>
          <CardContent className='pt-6'>
            <div className='space-y-3'>
              <div className={`w-10 h-10 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <div>
                <div className='text-2xl font-bold text-foreground'>{metric.value}</div>
                <div className='text-sm font-medium text-foreground/70'>{metric.title}</div>
                <div className='text-xs text-muted-foreground mt-1'>{metric.description}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
