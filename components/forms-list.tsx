'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { FileText, Trash2, Eye, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Form {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  _count: {
    submissions: number
  }
}

interface FormsListProps {
  orgId?: string
}

export function FormsList({ orgId }: FormsListProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Form | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      setForms([])
      setError(null)
      setIsLoading(false)
      return
    }

    // Reset loading state and forms when orgId changes to show loading skeleton
    // during navigation between organizations
    setIsLoading(true)
    setForms([])
    setError(null)

    fetchForms(true)

    // Set up polling for real-time updates (every 10 seconds)
    const interval = setInterval(() => fetchForms(false), 10000)
    return () => clearInterval(interval)
  }, [isLoaded, isSignedIn, orgId])

  const fetchForms = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const url = orgId ? `/api/forms?orgId=${orgId}` : '/api/forms'
      const response = await fetch(url, { signal: controller.signal, credentials: 'include' })
      clearTimeout(timeoutId)

      const contentType = response.headers.get('content-type')
      const isJson = contentType?.includes('application/json')

      if (!response.ok) {
        let errorDetails = `HTTP ${response.status}`
        if (isJson) {
          try {
            const data = await response.json()
            errorDetails = data.details || data.error || errorDetails
          } catch {
            errorDetails = `${response.status} ${response.statusText}`
          }
        } else {
          errorDetails = `${response.status} ${response.statusText}`
        }
        throw new Error(`Failed to fetch forms: ${errorDetails}`)
      }

      if (!isJson) {
        throw new Error('Invalid response: Server returned non-JSON data')
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setForms(data)
      } else if (data && typeof data === 'object' && data.error) {
        throw new Error(data.details || data.error)
      } else {
        setForms([])
      }

      setError(null)
    } catch (err: any) {
      let errorMessage = 'Failed to fetch forms'

      if (err?.name === 'AbortError') {
        errorMessage = 'Request timeout: Server took too long to respond'
      } else if (err instanceof Error) {
        errorMessage = err.message
      } else if (err instanceof TypeError) {
        errorMessage = 'Network error: Unable to connect to server'
      } else if (typeof err === 'string') {
        errorMessage = err
      }

      setError(errorMessage)
      console.error('[v0] Error fetching forms:', errorMessage, 'Original error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/forms/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        let errorMessage = `Failed to delete form (HTTP ${response.status})`
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          try {
            const data = await response.json()
            errorMessage = data.details || data.error || errorMessage
          } catch {
            // ignore parse error
          }
        }
        throw new Error(errorMessage)
      }

      setForms(forms.filter((f) => f.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete form'
      console.error('[v0] Error deleting form:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <Card>
        <CardContent className='space-y-3 pt-6'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
        </CardContent>
      </Card>
    )
  }

  if (!isSignedIn) {
    return (
      <Card className='border-dashed border-2 border-border/50 hover:border-primary/30 transition-colors'>
        <CardContent className='py-16 text-center'>
          <div className='w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4'>
            <FileText className='w-8 h-8 text-primary' />
          </div>
          <CardTitle className='mb-2 text-xl'>Sign in to manage your forms</CardTitle>
          <CardDescription className='mb-8 text-base'>
            Create, view, and manage your forms after signing in to your account
          </CardDescription>
          <Button render={<Link href='/sign-in' />} nativeButton={false} className='bg-primary hover:bg-primary/90'>
            Sign in
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle />
        <AlertTitle>Error loading forms</AlertTitle>
        <AlertDescription className='flex flex-col gap-3'>
          <span className='font-mono text-xs'>{error}</span>
          <Button variant='outline' size='sm' onClick={fetchForms} className='w-fit'>
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (forms.length === 0) {
    return (
      <Card className='border-dashed border-2 border-border/50 hover:border-primary/30 transition-colors'>
        <CardContent className='py-16 text-center'>
          <div className='w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4'>
            <FileText className='w-8 h-8 text-primary' />
          </div>
          <CardTitle className='mb-2 text-xl'>No forms yet</CardTitle>
          <CardDescription className='mb-8 text-base'>
            Create your first form to get started with dynamic form building
          </CardDescription>
          <Button render={<Link href='/forms/new' />} nativeButton={false} className='bg-primary hover:bg-primary/90'>
            Create your first form
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className='overflow-hidden py-0 border-border/50 shadow-lg'>
        <Table>
          <TableHeader className='bg-muted/50 border-b border-border/50'>
            <TableRow className='hover:bg-muted/50'>
              <TableHead className='px-6 py-4 font-semibold'>Title</TableHead>
              <TableHead className='px-6 py-4 font-semibold hidden md:table-cell'>Description</TableHead>
              <TableHead className='px-6 py-4 font-semibold'>Submissions</TableHead>
              <TableHead className='px-6 py-4 font-semibold hidden sm:table-cell'>Created</TableHead>
              <TableHead className='px-6 py-4 font-semibold text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.id} className='hover:bg-muted/30 transition-colors border-b border-border/30'>
                <TableCell className='px-6 py-4 font-semibold text-foreground'>{form.title}</TableCell>
                <TableCell className='px-6 py-4 text-muted-foreground hidden md:table-cell max-w-xs truncate'>
                  {form.description || '—'}
                </TableCell>
                <TableCell className='px-6 py-4'>
                  <Badge variant='secondary' className='bg-primary/10 text-primary border-primary/20'>{form._count.submissions}</Badge>
                </TableCell>
                <TableCell className='px-6 py-4 text-muted-foreground hidden sm:table-cell'>
                  {new Date(form.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className='px-6 py-4 text-right'>
                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      render={<Link href={`/forms/${form.id}/view`} />}
                      nativeButton={false}
                      title='View form'
                      className='hover:bg-primary/10 hover:text-primary transition-colors'
                    >
                      <Eye className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      render={<Link href={`/forms/${form.id}/submissions`} />}
                      nativeButton={false}
                      title='View submissions'
                      className='hover:bg-primary/10 hover:text-primary transition-colors'
                    >
                      <FileText className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      className='text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors'
                      onClick={() => setDeleteTarget(form)}
                      title='Delete form'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 className='text-destructive' />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.title}&quot; and all of its
              submissions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              onClick={(e) => {
                e.preventDefault()
                void handleDelete()
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
