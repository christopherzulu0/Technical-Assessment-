'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormBuilder } from '@/components/form-builder'
import { FormTemplates, FORM_TEMPLATES, templateToFormSchema } from '@/components/form-templates'
import { FormSchemaType } from '@/lib/validators'
import { SiteHeader } from '@/components/site-header'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LayoutTemplate, X, AlertCircle, Zap } from 'lucide-react'
import Link from 'next/link'

export default function NewFormPage() {
  return (
    <Suspense fallback={<div className='min-h-screen bg-background animate-pulse' />}>
      <NewFormPageContent />
    </Suspense>
  )
}

function NewFormPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const [error, setError] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [limitCheck, setLimitCheck] = useState<{
    allowed: boolean
    reason?: string
    currentForms: number
    limit: number | string
    plan: string
  } | null>(null)
  const [isLoadingLimit, setIsLoadingLimit] = useState(true)

  const selectedTemplate = templateId
    ? FORM_TEMPLATES.find((t) => t.id === templateId)
    : null

  const initialForm = selectedTemplate ? templateToFormSchema(selectedTemplate) : undefined

  useEffect(() => {
    const checkLimit = async () => {
      try {
        const response = await fetch('/api/forms/check-limit')
        if (response.ok) {
          const data = await response.json()
          setLimitCheck(data)
        }
      } catch (err) {
        console.error('Failed to check limit:', err)
      } finally {
        setIsLoadingLimit(false)
      }
    }
    checkLimit()
  }, [])

  const handleSave = async (formData: FormSchemaType) => {
    try {
      setError(null)
      const response = await fetch('/api/forms', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(
          data.details?.fieldErrors?._errors?.[0] ||
            data.error ||
            'Failed to create form'
        )
      }

      const form = await response.json()
      router.push(`/forms/${form.id}/view`)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const clearTemplate = () => {
    router.push('/forms/new')
    setShowTemplates(false)
  }

  return (
    <main className='min-h-screen bg-background'>
      <SiteHeader
        title='Create form'
        containerClassName='max-w-4xl'
        actions={
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setShowTemplates((v) => !v)}
          >
            <LayoutTemplate data-icon='inline-start' />
            {showTemplates ? 'Hide templates' : 'Browse templates'}
          </Button>
        }
      />

      <PageContainer size='sm'>
        {limitCheck && !limitCheck.allowed && (
          <Alert variant='destructive' className='mb-6 bg-destructive/10 text-destructive border-destructive/30'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription className='flex items-center justify-between flex-wrap gap-2'>
              <span>{limitCheck.reason}</span>
              <Link href='/pricing'>
                <Button size='sm' className='bg-destructive hover:bg-destructive/90'>
                  <Zap className='w-4 h-4 mr-2' />
                  Upgrade Plan
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {limitCheck && limitCheck.allowed && typeof limitCheck.limit === 'number' && (
          <Alert className='mb-6 bg-primary/5 text-primary border-primary/20'>
            <Zap className='h-4 w-4' />
            <AlertDescription>
              <span className='font-medium'>{limitCheck.plan} Plan:</span> {limitCheck.currentForms}/{limitCheck.limit} forms used
            </AlertDescription>
          </Alert>
        )}

        {showTemplates && (
          <Card className='mb-8 border-border/50 shadow-lg hover:shadow-xl transition-shadow'>
            <CardHeader className='bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/30'>
              <CardTitle className='text-xl'>Start from a template</CardTitle>
              <CardDescription className='text-base'>
                Pick a template to get started faster, or begin with a blank form.
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-6'>
              <FormTemplates showBlankOption onStartBlank={clearTemplate} />
            </CardContent>
          </Card>
        )}

        {selectedTemplate && (
          <div className='mb-6 flex items-center gap-3 flex-wrap p-4 bg-primary/5 rounded-lg border border-primary/20'>
            <Badge variant='secondary' className='gap-2 py-1.5 bg-primary/10 text-primary border-primary/30'>
              <LayoutTemplate className='w-4 h-4' />
              Using template: {selectedTemplate.name}
            </Badge>
            <Button type='button' variant='ghost' size='sm' onClick={clearTemplate} className='text-muted-foreground hover:text-foreground'>
              <X className='w-4 h-4 mr-1' />
              Clear
            </Button>
          </div>
        )}

        <Card className='border-border/50 shadow-lg'>
          <CardContent className='pt-6'>
            {error && (
              <Alert variant='destructive' className='mb-6 bg-destructive/10 text-destructive border-destructive/30'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {limitCheck && !limitCheck.allowed ? (
              <div className='text-center py-12'>
                <AlertCircle className='w-16 h-16 text-muted-foreground/30 mx-auto mb-4' />
                <p className='text-lg font-medium text-foreground mb-2'>Form limit reached</p>
                <p className='text-sm text-muted-foreground mb-6'>
                  Upgrade your plan to create more forms
                </p>
                <Link href='/pricing'>
                  <Button className='bg-primary hover:bg-primary/90'>
                    <Zap className='w-4 h-4 mr-2' />
                    View Plans
                  </Button>
                </Link>
              </div>
            ) : (
              <FormBuilder
                key={templateId ?? 'blank'}
                onSave={handleSave}
                initialForm={initialForm}
              />
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </main>
  )
}
