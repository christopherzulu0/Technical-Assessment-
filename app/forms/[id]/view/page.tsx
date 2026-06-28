'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Info } from 'lucide-react'
import { DynamicFormRenderer } from '@/components/dynamic-form-renderer'
import { FormShareExport } from '@/components/form-share-export'
import { FormSchemaType } from '@/lib/validators'
import { SiteHeader } from '@/components/site-header'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface FormData {
  id: string
  title: string
  description?: string
  schema: {
    title: string
    description?: string
    fields: any[]
  }
}

export default function FormViewPage() {
  const params = useParams()
  const formId = params.id as string

  const [form, setForm] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchForm()
  }, [formId])

  const fetchForm = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/forms/${formId}`)
      if (!response.ok) {
        if (response.status === 404) throw new Error('Form not found')
        throw new Error('Failed to load form')
      }
      const data = await response.json()
      setForm(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('[v0] Error fetching form:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      const response = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.details) {
          const err = new Error('Validation failed')
          ;(err as any).details = errorData.details
          throw err
        }
        throw new Error(errorData.error || 'Failed to submit form')
      }

      setSubmitted(true)
    } catch (err: any) {
      console.error('[v0] Error submitting form:', err)
      throw err
    }
  }

  if (isLoading) {
    return (
      <main className='min-h-screen bg-background'>
        <SiteHeader backLabel='← Back to Home' containerClassName='max-w-5xl' />
        <PageContainer size='md' className='space-y-4'>
          <Skeleton className='h-10 w-2/3' />
          <Skeleton className='h-64 w-full' />
        </PageContainer>
      </main>
    )
  }

  if (error) {
    return (
      <main className='min-h-screen bg-background'>
        <SiteHeader backLabel='← Back to Home' containerClassName='max-w-5xl' />
        <PageContainer size='md'>
          <Alert variant='destructive'>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </PageContainer>
      </main>
    )
  }

  if (!form) {
    return null
  }

  if (submitted) {
    return (
      <main className='min-h-screen bg-background flex items-center justify-center py-12'>
        <SiteHeader backLabel='← Back to Home' containerClassName='max-w-5xl' />
        <PageContainer size='md'>
          <Card className='text-center py-16 border-0 shadow-2xl bg-gradient-to-br from-background to-background'>
            <CardContent className='space-y-6'>
              <div className='flex justify-center'>
                <div className='w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center'>
                  <CheckCircle2 className='w-10 h-10 text-primary' />
                </div>
              </div>
              <div className='space-y-2'>
                <CardTitle className='text-4xl font-bold text-foreground'>Thank you!</CardTitle>
                <CardDescription className='text-lg text-muted-foreground'>
                  Your response has been submitted successfully and received.
                </CardDescription>
              </div>
              <Button size='lg' render={<Link href='/dashboard' />} nativeButton={false} className='bg-primary hover:bg-primary/90 mt-4'>
                Return Home
              </Button>
            </CardContent>
          </Card>
        </PageContainer>
      </main>
    )
  }

  return (
    <main className='min-h-screen bg-background'>
      <SiteHeader backLabel='← Back to Home' containerClassName='max-w-5xl' />

      <PageContainer size='md'>
        <div className='grid lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2'>
            <Card className='border-border/50 shadow-lg'>
              <CardHeader className='bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border-b border-border/30 pb-6'>
                <CardTitle className='text-4xl font-bold text-foreground'>{form.title}</CardTitle>
                {form.description && (
                  <CardDescription className='text-base text-muted-foreground mt-3'>{form.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {form.schema.fields.length === 0 ? (
                  <Alert>
                    <Info />
                    <AlertTitle>This form has no fields yet</AlertTitle>
                    <AlertDescription>
                      Fields can be added when editing is supported. For now, share this form
                      or return home.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <DynamicFormRenderer
                    formDef={form.schema as FormSchemaType}
                    onSubmit={handleSubmit}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className='lg:col-span-1'>
            <div className='sticky top-24'>
              <FormShareExport formId={formId} formTitle={form.title} />
            </div>
          </div>
        </div>
      </PageContainer>
    </main>
  )
}
