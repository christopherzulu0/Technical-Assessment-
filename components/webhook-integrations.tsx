'use client'

import { useState } from 'react'
import { Copy, Check, Plus, Trash2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Webhook {
  id: string
  url: string
  events: string[]
  active: boolean
  createdAt: string
  lastTriggered?: string
}

interface WebhookIntegrationProps {
  webhooks?: Webhook[]
  onAddWebhook?: (url: string, events: string[]) => void
  onDeleteWebhook?: (id: string) => void
}

const EVENT_OPTIONS = [
  { id: 'response_submitted', label: 'Response Submitted', description: 'When a new response is received' },
  { id: 'form_published', label: 'Form Published', description: 'When a form is published' },
  { id: 'form_updated', label: 'Form Updated', description: 'When form fields change' },
  { id: 'response_archived', label: 'Response Archived', description: 'When a response is archived' },
]

export function WebhookIntegrations({
  webhooks = [],
  onAddWebhook,
  onDeleteWebhook,
}: WebhookIntegrationProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['response_submitted'])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleAddWebhook = () => {
    if (webhookUrl.trim()) {
      onAddWebhook?.(webhookUrl, selectedEvents)
      setWebhookUrl('')
      setSelectedEvents(['response_submitted'])
      setShowAddForm(false)
    }
  }

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    )
  }

  return (
    <div className='space-y-6'>
      {/* Webhooks Info */}
      <Card className='border-blue-200 bg-blue-50'>
        <CardContent className='p-4 flex gap-3'>
          <AlertCircle className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
          <div>
            <p className='font-medium text-blue-900'>Webhook Integration</p>
            <p className='text-sm text-blue-700 mt-1'>
              Send real-time data to your application whenever form events occur.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add Webhook Form */}
      {showAddForm && (
        <Card className='border-border/50 bg-gradient-to-br from-background to-muted/10'>
          <CardHeader>
            <CardTitle className='text-lg'>Add New Webhook</CardTitle>
            <CardDescription>Set up a webhook to receive form events</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-foreground block mb-2'>
                Webhook URL
              </label>
              <input
                type='url'
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder='https://your-domain.com/webhook'
                className='w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
              />
              <p className='text-xs text-muted-foreground mt-1'>
                Must be a valid HTTPS URL
              </p>
            </div>

            <div>
              <label className='text-sm font-medium text-foreground block mb-2'>
                Events to Subscribe
              </label>
              <div className='space-y-2'>
                {EVENT_OPTIONS.map((event) => (
                  <label
                    key={event.id}
                    className='flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={selectedEvents.includes(event.id)}
                      onChange={() => toggleEvent(event.id)}
                      className='w-4 h-4 mt-1 cursor-pointer'
                    />
                    <div>
                      <p className='font-medium text-sm text-foreground'>{event.label}</p>
                      <p className='text-xs text-muted-foreground'>{event.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className='flex gap-2'>
              <Button
                onClick={handleAddWebhook}
                disabled={!webhookUrl.trim() || selectedEvents.length === 0}
                className='bg-primary hover:bg-primary/90'
              >
                Create Webhook
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                variant='outline'
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Webhooks List */}
      <Card className='border-border/50'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle className='text-lg'>Webhooks ({webhooks.length})</CardTitle>
            <CardDescription>Manage your webhook endpoints</CardDescription>
          </div>
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className='bg-primary hover:bg-primary/90'
            >
              <Plus className='w-4 h-4 mr-2' />
              Add Webhook
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className='text-center py-8'>
              <AlertCircle className='w-12 h-12 text-muted-foreground/30 mx-auto mb-3' />
              <p className='text-sm text-muted-foreground'>No webhooks configured yet</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className='p-4 rounded-lg border border-border/50 bg-muted/20 space-y-3'
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className={`${
                            webhook.active
                              ? 'bg-green-500/10 text-green-700 border-green-200'
                              : 'bg-gray-500/10 text-gray-700 border-gray-200'
                          }`}
                        >
                          {webhook.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className='text-xs text-muted-foreground'>
                          Created {new Date(webhook.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className='flex items-center gap-2 mt-2'>
                        <code className='text-xs bg-background px-2 py-1 rounded border border-border flex-1 truncate'>
                          {webhook.url}
                        </code>
                        <button
                          onClick={() => handleCopyUrl(webhook.url, webhook.id)}
                          className='p-1.5 text-muted-foreground hover:text-foreground hover:bg-background rounded transition-colors'
                        >
                          {copiedId === webhook.id ? (
                            <Check className='w-4 h-4 text-green-600' />
                          ) : (
                            <Copy className='w-4 h-4' />
                          )}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteWebhook?.(webhook.id)}
                      className='p-2 text-destructive hover:bg-destructive/10 rounded transition-colors'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>

                  <div>
                    <p className='text-xs font-medium text-muted-foreground mb-2'>Events:</p>
                    <div className='flex flex-wrap gap-1'>
                      {webhook.events.map((event) => (
                        <Badge
                          key={event}
                          variant='secondary'
                          className='text-xs bg-primary/10 text-primary border-primary/20'
                        >
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {webhook.lastTriggered && (
                    <p className='text-xs text-muted-foreground'>
                      Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook Docs */}
      <Card className='border-border/50'>
        <CardHeader>
          <CardTitle className='text-base'>Webhook Payload Example</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className='bg-muted p-4 rounded-lg text-xs overflow-x-auto'>
{`{
  "event": "response_submitted",
  "formId": "abc123",
  "formTitle": "Contact Form",
  "responseId": "resp_xyz789",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "fields": [
      {
        "name": "email",
        "value": "user@example.com"
      },
      {
        "name": "message",
        "value": "Hello, this is a test"
      }
    ]
  }
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
