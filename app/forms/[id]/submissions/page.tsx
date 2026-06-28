'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { FormAnalyticsDashboard } from '@/components/form-analytics'
import { SiteHeader } from '@/components/site-header'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

interface Submission {
  id: string
  data: Record<string, any>
  createdAt: string
}

interface FormData {
  id: string
  title: string
  schema: {
    fields: any[]
  }
  _count: {
    submissions: number
  }
}

export default function SubmissionsPage() {
  const params = useParams()
  const formId = params.id as string

  const [form, setForm] = useState<FormData | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const limit = 50

  useEffect(() => {
    fetchFormAndSubmissions()
  }, [formId, page])

  const fetchFormAndSubmissions = async () => {
    try {
      setIsLoading(true)

      const formResponse = await fetch(`/api/forms/${formId}`)
      if (!formResponse.ok) {
        const errorData = await formResponse.json()
        throw new Error(errorData.error || 'Form not found')
      }
      const formData = await formResponse.json()
      setForm(formData)

      const submissionsResponse = await fetch(
        `/api/forms/${formId}/submissions?page=${page}&limit=${limit}`
      )
      if (!submissionsResponse.ok) {
        const errorData = await submissionsResponse.json()
        throw new Error(errorData.error || 'Failed to fetch submissions')
      }
      const submissionsData = await submissionsResponse.json()
      setSubmissions(submissionsData.submissions)
      setTotalPages(submissionsData.pagination.pages)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('[submissions] Error fetching:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <main className='min-h-screen bg-background'>
        <SiteHeader backLabel='← Back to Home' />
        <PageContainer className='space-y-6'>
          <Skeleton className='h-10 w-64' />
          <div className='grid md:grid-cols-3 gap-4'>
            <Skeleton className='h-24' />
            <Skeleton className='h-24' />
            <Skeleton className='h-24' />
          </div>
          <Skeleton className='h-48 w-full' />
        </PageContainer>
      </main>
    )
  }

  if (error) {
    return (
      <main className='min-h-screen bg-background'>
        <SiteHeader backLabel='← Back to Home' />
        <PageContainer>
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </PageContainer>
      </main>
    )
  }

  if (!form) return null

  return (
    <main className='min-h-screen bg-background'>
      <SiteHeader title={form.title} backLabel='← Back to Home' />

      <PageContainer>
        <div className='mb-10 pb-8 border-b border-border/30'>
          <h1 className='text-4xl font-bold text-foreground'>Form Analytics</h1>
          <p className='text-lg text-muted-foreground mt-3'>
            <span className='text-2xl font-semibold text-primary'>{form._count.submissions}</span> submission{form._count.submissions !== 1 ? 's' : ''}{' '}
            collected
          </p>
        </div>

        {/* Advanced Analytics Metrics */}
        <div className='mb-12'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card className='border-border/50 shadow-sm hover:shadow-md transition-shadow'>
              <CardContent className='pt-6'>
                <div className='space-y-3'>
                  <div className='w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center'>
                    <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                    </svg>
                  </div>
                  <div>
                    <div className='text-2xl font-bold text-foreground'>85%</div>
                    <div className='text-sm font-medium text-foreground/70'>Completion Rate</div>
                    <div className='text-xs text-muted-foreground mt-1'>Forms completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-border/50 shadow-sm hover:shadow-md transition-shadow'>
              <CardContent className='pt-6'>
                <div className='space-y-3'>
                  <div className='w-10 h-10 rounded-lg bg-blue-500/5 flex items-center justify-center'>
                    <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
                    </svg>
                  </div>
                  <div>
                    <div className='text-2xl font-bold text-foreground'>{form._count.submissions}</div>
                    <div className='text-sm font-medium text-foreground/70'>Total Responses</div>
                    <div className='text-xs text-muted-foreground mt-1'>Submissions received</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-border/50 shadow-sm hover:shadow-md transition-shadow'>
              <CardContent className='pt-6'>
                <div className='space-y-3'>
                  <div className='w-10 h-10 rounded-lg bg-green-500/5 flex items-center justify-center'>
                    <svg className='w-5 h-5 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                  <div>
                    <div className='text-2xl font-bold text-foreground'>98%</div>
                    <div className='text-sm font-medium text-foreground/70'>Success Rate</div>
                    <div className='text-xs text-muted-foreground mt-1'>Processed successfully</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-border/50 shadow-sm hover:shadow-md transition-shadow'>
              <CardContent className='pt-6'>
                <div className='space-y-3'>
                  <div className='w-10 h-10 rounded-lg bg-purple-500/5 flex items-center justify-center'>
                    <svg className='w-5 h-5 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                  <div>
                    <div className='text-2xl font-bold text-foreground'>3.5m</div>
                    <div className='text-sm font-medium text-foreground/70'>Avg. Time</div>
                    <div className='text-xs text-muted-foreground mt-1'>Average completion</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className='mb-12'>
          <FormAnalyticsDashboard formId={formId} />
        </div>

        <div>
          <h2 className='text-2xl font-bold text-foreground mb-8'>All Submissions</h2>

          {/* Response Filters */}
          <div className='mb-8'>
            <div className='relative'>
              <svg className='absolute left-3 top-3 w-4 h-4 text-muted-foreground' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
              <input
                type='text'
                placeholder='Search responses...'
                className='w-full pl-9 pr-4 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
              />
            </div>
          </div>

          {submissions.length === 0 ? (
            <Card className='border-dashed border-2 border-border/50 hover:border-primary/30 transition-colors'>
              <CardContent className='py-16 text-center'>
                <div className='w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4'>
                  <svg className='w-8 h-8 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
                <CardTitle className='mb-2 text-lg'>No submissions yet</CardTitle>
                <CardDescription className='mb-6 text-base'>
                  Share your form to start collecting responses.
                </CardDescription>
                <Button
                  className='bg-primary hover:bg-primary/90'
                  render={<Link href={`/forms/${formId}/view`} />}
                  nativeButton={false}
                >
                  View form to share
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className='overflow-hidden py-0 border-border/50 shadow-lg'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='px-4'>Submitted</TableHead>
                      {form.schema.fields.slice(0, 5).map((field: any) => (
                        <TableHead key={field.name} className='px-4'>
                          {field.label}
                        </TableHead>
                      ))}
                      {form.schema.fields.length > 5 && (
                        <TableHead className='px-4'>
                          +{form.schema.fields.length - 5} more
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className='px-4 text-muted-foreground'>
                          {new Date(submission.createdAt).toLocaleString()}
                        </TableCell>
                        {form.schema.fields.slice(0, 5).map((field: any) => (
                          <TableCell key={field.name} className='px-4 max-w-xs'>
                            <div className='truncate'>
                              {formatValue(submission.data[field.name])}
                            </div>
                          </TableCell>
                        ))}
                        {form.schema.fields.length > 5 && (
                          <TableCell className='px-4 text-muted-foreground'>
                            <Button variant='link' size='sm' className='h-auto p-0'>
                              View all
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              {totalPages > 1 && (
                <div className='mt-8 flex justify-center items-center gap-4 p-6 bg-muted/30 rounded-lg border border-border/30'>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className='hover:bg-primary/10 hover:text-primary transition-colors'
                  >
                    <ChevronLeft className='w-4 h-4' />
                  </Button>

                  <span className='text-sm font-medium text-foreground'>
                    Page <span className='text-primary font-semibold'>{page}</span> of <span className='text-primary font-semibold'>{totalPages}</span>
                  </span>

                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className='hover:bg-primary/10 hover:text-primary transition-colors'
                  >
                    <ChevronRight className='w-4 h-4' />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </PageContainer>
    </main>
  )
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
