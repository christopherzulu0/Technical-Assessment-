import { PageContainer } from '@/components/page-container'
import { FormsList } from '@/components/forms-list'
import { Button } from '@/components/ui/button'
import { getDashboardStats } from '@/lib/dashboard-stats'
import Link from 'next/link'
import { DashboardStats } from '@/components/dashboard-stats'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default async function OrganizationDashboard({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  
  let stats
  let error: string | null = null
  
  try {
    stats = await getDashboardStats(orgId)
  } catch (err: any) {
    console.error('Error loading dashboard stats on server:', err)
    error = err.message || 'Failed to load dashboard statistics'
  }

  return (
    <PageContainer className='py-12'>
      {error ? (
        <div className='mb-12'>
          <Alert variant='destructive'>
            <AlertCircle className='w-4 h-4' />
            <AlertTitle>Error loading dashboard</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <DashboardStats orgId={orgId} initialStats={stats} />
      )}

      <div className='mb-8'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='text-2xl font-bold text-foreground'>Your Forms</h2>
            <p className='text-muted-foreground mt-1'>Create and manage forms for your organization</p>
          </div>
          <Button
            render={<Link href='/forms/new' />}
            nativeButton={false}
            className='bg-primary hover:bg-primary/90'
          >
            Create New Form
          </Button>
        </div>
        <FormsList orgId={orgId} />
      </div>
    </PageContainer>
  )
}
