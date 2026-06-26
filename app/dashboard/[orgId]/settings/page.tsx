'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth, useOrganization } from '@clerk/nextjs'
import { OrganizationPricingTable } from '@/components/billing/organization-pricing-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageContainer } from '@/components/page-container'
import { Badge } from '@/components/ui/badge'
import { WebhookIntegrations } from '@/components/webhook-integrations'
import { Users, CreditCard, Lock, Bell } from 'lucide-react'

export default function SettingsPage() {
  const { organization, isLoaded } = useOrganization()
  const { has } = useAuth()
  const [activeTab, setActiveTab] = useState('billing')
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(false)

  const canUseSso = has?.({ feature: 'sso' }) ?? false
  const canUseWebhooks = has?.({ feature: 'webhooks' }) ?? false

  const loadWebhooks = async () => {
    if (!organization?.id) return

    setIsLoadingWebhooks(true)
    try {
      const response = await fetch('/api/webhooks', {
        credentials: 'include',
        headers: { 'x-organization-id': organization?.id ?? '' },
      })
      if (!response.ok) throw new Error('Failed to load webhooks')
      const data = await response.json()
      setWebhooks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('[settings] failed to load webhooks', error)
    } finally {
      setIsLoadingWebhooks(false)
    }
  }

  const handleAddWebhook = async (url: string, events: string[]) => {
    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': organization?.id ?? '',
        },
        body: JSON.stringify({ url, events }),
      })

      if (!response.ok) throw new Error('Failed to create webhook')
      await loadWebhooks()
    } catch (error) {
      console.error('[settings] failed to create webhook', error)
    }
  }

  const handleDeleteWebhook = async (id: string) => {
    try {
      const response = await fetch(`/api/webhooks?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'x-organization-id': organization?.id ?? '' },
      })
      if (!response.ok) throw new Error('Failed to delete webhook')
      await loadWebhooks()
    } catch (error) {
      console.error('[settings] failed to delete webhook', error)
    }
  }

  useEffect(() => {
    loadWebhooks()
  }, [organization?.id])

  if (!isLoaded) {
    return <div className='min-h-screen bg-background animate-pulse' />
  }

  return (
    <PageContainer className='py-12'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-foreground'>Organization Settings</h1>
        <p className='text-muted-foreground mt-2'>{organization?.name}</p>
      </div>

      <div className='grid lg:grid-cols-4 gap-6'>
        <div className='lg:col-span-1'>
          <nav className='space-y-2'>
            {[
              { id: 'billing', label: 'Billing', icon: CreditCard },
              { id: 'members', label: 'Team Members', icon: Users },
              { id: 'security', label: 'Security', icon: Lock },
              { id: 'notifications', label: 'Notifications', icon: Bell },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary text-white'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className='w-5 h-5' />
                  <span className='font-medium'>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className='lg:col-span-3'>
          {activeTab === 'billing' && (
            <div className='space-y-6'>
              <Card className='border-border/50 shadow-sm'>
                <CardHeader>
                  <CardTitle>Subscription Plans</CardTitle>
                  <CardDescription>
                    Manage your organization subscription through Clerk Billing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OrganizationPricingTable />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'members' && (
            <Card className='border-border/50 shadow-sm'>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Invite and manage organization members</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  render={<Link href={`/dashboard/${organization?.id}/members`} />}
                  nativeButton={false}
                  className='bg-primary hover:bg-primary/90'
                >
                  Manage Members
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className='border-border/50 shadow-sm'>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage authentication and data security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-4 border border-border/30 rounded-lg'>
                    <div>
                      <div className='font-medium text-foreground'>Webhooks</div>
                      <div className='text-sm text-muted-foreground'>
                        {canUseWebhooks
                          ? 'Configure outbound webhooks for form events'
                          : 'Available on Starter plan and above'}
                      </div>
                    </div>
                    <Badge variant={canUseWebhooks ? 'default' : 'secondary'}>
                      {canUseWebhooks ? 'Enabled' : 'Upgrade required'}
                    </Badge>
                  </div>
                  {canUseWebhooks && (
                    <div className='mt-4'>
                      {isLoadingWebhooks ? (
                        <div className='text-sm text-muted-foreground'>Loading webhooks…</div>
                      ) : (
                        <WebhookIntegrations
                          webhooks={webhooks}
                          onAddWebhook={handleAddWebhook}
                          onDeleteWebhook={handleDeleteWebhook}
                        />
                      )}
                    </div>
                  )}
                  <div className='flex items-center justify-between p-4 border border-border/30 rounded-lg'>
                    <div>
                      <div className='font-medium text-foreground'>Single Sign-On (SSO)</div>
                      <div className='text-sm text-muted-foreground'>
                        {canUseSso
                          ? 'Configure SAML/OIDC for your organization'
                          : 'Available on Professional plan and above'}
                      </div>
                    </div>
                    <Button variant='outline' disabled={!canUseSso}>
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className='border-border/50 shadow-sm'>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {[
                    'New form submissions',
                    'Form published',
                    'Team member joined',
                    'Billing updates',
                  ].map((notification) => (
                    <div
                      key={notification}
                      className='flex items-center justify-between p-4 border border-border/30 rounded-lg'
                    >
                      <span className='text-foreground'>{notification}</span>
                      <input type='checkbox' defaultChecked className='w-5 h-5 rounded' />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
