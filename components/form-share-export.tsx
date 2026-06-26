'use client'

import { useState } from 'react'
import { Copy, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface FormShareExportProps {
  formId: string
  formTitle: string
}

export function FormShareExport({ formId, formTitle }: FormShareExportProps) {
  const [copiedLink, setCopiedLink] = useState(false)

  const formLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/forms/${formId}/view`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleExportSubmissions = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/forms/${formId}/submissions`)
      const submissions = await response.json()

      if (!Array.isArray(submissions)) return

      let content: string
      let filename: string

      if (format === 'csv') {
        const fields = submissions[0] ? Object.keys(submissions[0]) : []
        const headers = fields.join(',')
        const rows = submissions.map((submission: any) =>
          fields
            .map((field) => {
              const value = submission[field]
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`
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
      alert('Failed to export submissions')
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
          <Button className='flex-1' onClick={() => handleExportSubmissions('csv')}>
            <Download data-icon='inline-start' />
            Export CSV
          </Button>
          <Button
            variant='outline'
            className='flex-1'
            onClick={() => handleExportSubmissions('json')}
          >
            <Download data-icon='inline-start' />
            Export JSON
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
    </div>
  )
}
