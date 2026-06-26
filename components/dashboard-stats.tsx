'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, Users, FileText, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Stats {
  totalForms: number
  totalResponses: number
  teamMembers: number
  avgCompletion: number
}

interface DashboardStatsProps {
  orgId: string
  initialStats?: Stats
}

export function DashboardStats({ orgId, initialStats }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats | null>(initialStats || null)
  const [isLoading, setIsLoading] = useState(!initialStats)
  const [error, setError] = useState<string | null>(null)

  // Update internal stats state when initialStats prop changes (during navigation)
  useEffect(() => {
    if (initialStats) {
      setStats(initialStats)
      setIsLoading(false)
      setError(null)
    }
  }, [initialStats])

  const fetchStats = useCallback(async () => {
    try {
      const url = `/api/dashboard/stats?orgId=${orgId}`
      console.log('DashboardStats: Fetching from', url)
      const response = await fetch(url, { credentials: 'include' })
      console.log('DashboardStats: Response status', response.status)
      
      const contentType = response.headers.get('content-type')
      const isJson = contentType?.includes('application/json')

      if (!response.ok) {
        let errorDetails = `HTTP ${response.status}`
        if (isJson) {
          try {
            const data = await response.json()
            errorDetails = data.error || errorDetails
          } catch {}
        }
        throw new Error(errorDetails)
      }

      if (!isJson) throw new Error('Response is not JSON')
      
      const data = await response.json()
      console.log('DashboardStats: Received data', data)
      setStats(data)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [orgId])

  useEffect(() => {
    // Initial fetch if no initial stats
    if (!initialStats) {
      fetchStats()
    }

    // Set up polling for real-time updates (every 10 seconds)
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [fetchStats, initialStats])

  const statCards = [
    { 
      icon: FileText, 
      label: 'Total Forms', 
      value: stats ? String(stats.totalForms) : '0' 
    },
    { 
      icon: BarChart3, 
      label: 'Total Responses', 
      value: stats ? String(stats.totalResponses) : '0' 
    },
    { 
      icon: TrendingUp, 
      label: 'Avg. Completion', 
      value: stats ? `${stats.avgCompletion}%` : '0%' 
    },
    { 
      icon: Users, 
      label: 'Team Members', 
      value: stats ? String(stats.teamMembers) : '0' 
    },
  ]

  if (error) {
    return (
      <div className='mb-12'>
        <Alert variant='destructive'>
          <AlertCircle className='w-4 h-4' />
          <AlertTitle>Error loading stats</AlertTitle>
          <AlertDescription className='flex flex-col gap-3'>
            <span className='font-mono text-xs'>{error}</span>
            <Button variant='outline' size='sm' onClick={fetchStats} className='w-fit'>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading && !stats) {
    console.log('DashboardStats: Still loading and no stats')
    return (
      <div className='grid md:grid-cols-4 gap-4 mb-12'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='border-border/50 shadow-sm'>
            <CardContent className='pt-6'>
              <Skeleton className='h-8 w-16 mb-2' />
              <Skeleton className='h-4 w-24' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid md:grid-cols-4 gap-4 mb-12'>
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className='border-border/50 shadow-sm hover:shadow-md transition-shadow'>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-2xl font-bold text-foreground'>{stat.value}</div>
                  <div className='text-xs text-muted-foreground mt-1'>{stat.label}</div>
                </div>
                <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
                  <Icon className='w-5 h-5 text-primary' />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
