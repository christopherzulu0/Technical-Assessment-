'use client'

import { useState } from 'react'
import { useUser, useOrganizationList } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageContainer } from '@/components/page-container'
import { CheckCircle2 } from 'lucide-react'

export default function OnboardingPage() {
  const { user } = useUser()
  const { createOrganization, isLoaded } = useOrganizationList()
  const router = useRouter()
  const [step, setStep] = useState<'welcome' | 'create-org' | 'invite'>('welcome')
  const [orgName, setOrgName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateOrg = async () => {
    if (!orgName.trim()) return

    setIsCreating(true)
    try {
      const org = await createOrganization({ name: orgName })
      if (org) {
        await fetch('/api/organizations', { method: 'POST', credentials: 'include' })
        router.push(`/dashboard/${org.id}`)
      }
    } catch (error) {
      console.error('Failed to create organization:', error)
      setIsCreating(false)
    }
  }

  if (!isLoaded || !user) {
    return <div className='min-h-screen bg-background animate-pulse' />
  }

  return (
    <main className='min-h-screen bg-gradient-to-br from-background via-background to-primary/5'>
      <PageContainer className='py-12'>
        <div className='max-w-2xl mx-auto'>
          {/* Welcome Step */}
          {step === 'welcome' && (
            <Card className='border-border/50 shadow-lg'>
              <CardHeader className='bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/30'>
                <CardTitle className='text-3xl'>Welcome to FormBuilder</CardTitle>
                <CardDescription className='text-base'>
                  Let&apos;s set up your workspace
                </CardDescription>
              </CardHeader>
              <CardContent className='pt-12'>
                <div className='space-y-6 mb-8'>
                  {[
                    { icon: '📝', title: 'Create Beautiful Forms', desc: 'Build professional forms without coding' },
                    { icon: '📊', title: 'Collect Responses', desc: 'Gather data with advanced analytics' },
                    { icon: '👥', title: 'Collaborate', desc: 'Invite team members and manage permissions' },
                    { icon: '🔗', title: 'Integrate', desc: 'Connect with your favorite tools via webhooks' },
                  ].map((feature, i) => (
                    <div key={i} className='flex gap-4'>
                      <span className='text-3xl'>{feature.icon}</span>
                      <div>
                        <h4 className='font-semibold text-foreground'>{feature.title}</h4>
                        <p className='text-sm text-muted-foreground'>{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='bg-muted/50 border border-border/30 rounded-lg p-6 mb-8'>
                  <div className='font-semibold text-foreground mb-2'>Welcome, {user.firstName}!</div>
                  <p className='text-sm text-muted-foreground'>
                    You&apos;re all set. Now let&apos;s create your first organization.
                  </p>
                </div>

                <Button
                  onClick={() => setStep('create-org')}
                  className='w-full bg-primary hover:bg-primary/90 text-lg py-6'
                >
                  Create Your First Organization
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Create Organization Step */}
          {step === 'create-org' && (
            <Card className='border-border/50 shadow-lg'>
              <CardHeader className='bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/30'>
                <CardTitle className='text-3xl'>Create Organization</CardTitle>
                <CardDescription>Give your workspace a name</CardDescription>
              </CardHeader>
              <CardContent className='pt-8'>
                <div className='mb-8'>
                  <label className='block text-sm font-semibold text-foreground mb-3'>
                    Organization Name
                  </label>
                  <input
                    type='text'
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder='e.g., Acme Inc, My Startup'
                    className='w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateOrg()
                      }
                    }}
                  />
                  <p className='text-xs text-muted-foreground mt-2'>
                    You can change this later in settings
                  </p>
                </div>

                <div className='space-y-3'>
                  <Button
                    onClick={handleCreateOrg}
                    disabled={!orgName.trim() || isCreating}
                    className='w-full bg-primary hover:bg-primary/90 py-6'
                  >
                    {isCreating ? 'Creating...' : 'Create Organization'}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => setStep('welcome')}
                    className='w-full'
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Progress Indicator */}
        <div className='mt-12 flex justify-center gap-2'>
          {['welcome', 'create-org', 'invite'].map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                step === s || (step === 'invite' && i < 2)
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>
      </PageContainer>
    </main>
  )
}
