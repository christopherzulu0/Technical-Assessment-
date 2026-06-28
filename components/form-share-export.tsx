'use client'

import { useState } from 'react'
import { Copy, Download, Share2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface FormShareExportProps {
  formId: string
  formTitle: string
}

export function FormShareExport({ formId, formTitle }: FormShareExportProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<'csv' | 'json' | null>(null)
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean
    title: string
    message: string
  }>({ open: false, title: '', message: '' })

  const formLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/forms/${formId}/view`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleExportSubmissions = async (format: 'csv' | 'json') => {
    setExportingFormat(format)
    try {
      const response = await fetch(`/api/forms/${formId}/submissions`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch submissions')
      }
      const data = await response.json()
      const submissions = data.submissions

      if (!Array.isArray(submissions) || submissions.length === 0) {
        setErrorDialog({
          open: true,
          title: 'No Submissions',
          message: 'There are no submissions to export yet.',
        })
        return
      }

      let content: string
      let filename: string

      if (format === 'csv') {
        // Flatten the data field for CSV export
        const flattenedSubmissions = submissions.map((submission: any) => ({
          id: submission.id,
          createdAt: submission.createdAt,
          ...submission.data,
        }))
        
        const fields = flattenedSubmissions[0] ? Object.keys(flattenedSubmissions[0]) : []
        const headers = fields.join(',')
        const rows = flattenedSubmissions.map((submission: any) =>
          fields
            .map((field) => {
              const value = submission[field]
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`
              }
              if (typeof value === 'object') {
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`
              }
              return value
            })
            .join(',')
        )
        content = [headers, ...rows].join('\n')
        filename = `${formTitle}-submissions-${new Date().toISOString().split('T')[0]}.csv`
      } else {
        content = JSON.stringify(submissions, null, 2)
        filename = `${formTitle}-submissions-${new Date().toISOString().split('T')[0]}.json`
      }

      const blob = new Blob([content], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      setErrorDialog({
        open: true,
        title: 'Export Failed',
        message: error instanceof Error ? error.message : 'Failed to export submissions',
      })
    } finally {
      setExportingFormat(null)
    }
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Share2 className='w-5 h-5 text-primary' />
            <CardTitle>Share Form</CardTitle>
          </div>
          <CardDescription>Share this unique link to collect responses</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex gap-2'>
            <Input readOnly value={formLink} className='font-mono text-xs' />
            <Button onClick={handleCopyLink} className='shrink-0'>
              <Copy data-icon='inline-start' />
              {copiedLink ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          <div className='flex gap-2 flex-wrap'>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?url=${encodeURIComponent(formLink)}&text=${encodeURIComponent(`Check out my form: ${formTitle}`)}`,
                  '_blank'
                )
              }
            >
              Twitter
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formLink)}`,
                  '_blank'
                )
              }
            >
              Facebook
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(formLink)}`,
                  '_blank'
                )
              }
            >
              LinkedIn
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Download className='w-5 h-5 text-primary' />
            <CardTitle>Export Submissions</CardTitle>
          </div>
          <CardDescription>
            Download all form submissions in your preferred format
          </CardDescription>
        </CardHeader>
        <CardContent className='flex gap-2'>
          <Button 
            className='flex-1' 
            onClick={() => handleExportSubmissions('csv')}
            disabled={exportingFormat !== null}
          >
            {exportingFormat === 'csv' ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Exporting...
              </>
            ) : (
              <>
                <Download data-icon='inline-start' />
                Export CSV
              </>
            )}
          </Button>
          <Button
            variant='outline'
            className='flex-1'
            onClick={() => handleExportSubmissions('json')}
            disabled={exportingFormat !== null}
          >
            {exportingFormat === 'json' ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Exporting...
              </>
            ) : (
              <>
                <Download data-icon='inline-start' />
                Export JSON
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Embed Form</CardTitle>
          <CardDescription>
            Embed this form on your website using an iframe
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='bg-muted rounded-lg p-3 font-mono text-xs overflow-x-auto'>
            <code className='text-foreground'>
              {`<iframe src="${formLink}" width="100%" height="600" frameborder="0"></iframe>`}
            </code>
          </div>
          <Button
            className='w-full'
            variant='outline'
            onClick={() => {
              navigator.clipboard.writeText(
                `<iframe src="${formLink}" width="100%" height="600" frameborder="0"></iframe>`
              )
            }}
          >
            <Copy data-icon='inline-start' />
            Copy embed code
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={errorDialog.open} onOpenChange={(open: boolean) => setErrorDialog({ ...errorDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{errorDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog({ ...errorDialog, open: false })}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
