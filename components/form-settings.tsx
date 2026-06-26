'use client'

import { useState } from 'react'
import { Settings, Copy, Eye, Lock, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface FormSettingsProps {
  form: {
    id: string
    title: string
    status: 'active' | 'paused' | 'closed'
    _count: { submissions: number }
  }
  onStatusChange?: (status: 'active' | 'paused' | 'closed') => void
}

export function FormSettings({ form, onStatusChange }: FormSettingsProps) {
  const [copied, setCopied] = useState(false)
  const formUrl = typeof window !== 'undefined' ? `${window.location.origin}/forms/${form.id}/view` : ''

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className='border-border/50 shadow-sm'>
      <CardHeader className='bg-gradient-to-r from-muted/30 to-transparent border-b border-border/30'>
        <div className='flex items-center gap-2'>
          <Settings className='w-5 h-5 text-primary' />
          <div>
            <CardTitle className='text-lg'>Form Settings</CardTitle>
            <CardDescription>Manage your form configuration and access</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-6 space-y-6'>
        {/* Status */}
        <div>
          <h3 className='font-semibold text-foreground mb-3'>Status</h3>
          <div className='flex gap-2 flex-wrap'>
            {(['active', 'paused', 'closed'] as const).map((status) => (
              <Button
                key={status}
                variant={form.status === status ? 'default' : 'outline'}
                size='sm'
                onClick={() => onStatusChange?.(status)}
                className={form.status === status ? 'bg-primary hover:bg-primary/90' : ''}
              >
                {status === 'active' && <Eye className='w-4 h-4 mr-2' />}
                {status === 'paused' && <Lock className='w-4 h-4 mr-2' />}
                {status === 'closed' && <BarChart3 className='w-4 h-4 mr-2' />}
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Form Link */}
        <div>
          <h3 className='font-semibold text-foreground mb-3'>Share Form</h3>
          <div className='flex gap-2'>
            <input
              type='text'
              value={formUrl}
              readOnly
              className='flex-1 px-3 py-2 bg-muted border border-border rounded-md text-sm'
            />
            <Button size='sm' variant='outline' onClick={copyToClipboard} className='bg-primary/10 hover:bg-primary/20 text-primary border-primary/30'>
              <Copy className='w-4 h-4 mr-2' />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 gap-4 pt-4 border-t border-border/30'>
          <div className='p-3 bg-primary/5 rounded-lg'>
            <div className='text-2xl font-bold text-primary'>{form._count.submissions}</div>
            <div className='text-xs text-muted-foreground mt-1'>Total Submissions</div>
          </div>
          <div className='p-3 bg-secondary/5 rounded-lg'>
            <div className='text-2xl font-bold text-secondary'>{form.status === 'active' ? 'Live' : 'Inactive'}</div>
            <div className='text-xs text-muted-foreground mt-1'>Status</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
