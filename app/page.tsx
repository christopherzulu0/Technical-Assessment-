import Link from 'next/link'
import { Sparkles, Gauge, Shield, ClipboardList, Zap, Users, Palette, GitBranch, Bell, Code } from 'lucide-react'
import { FormsList } from '@/components/forms-list'
import { HomeHeroCta } from '@/components/home-hero-cta'
import { SiteHeader } from '@/components/site-header'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const coreFeatures = [
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Auto-generate forms with intelligent field suggestions',
  },
  {
    icon: Gauge,
    title: 'Real-time Analytics',
    description: 'Track submissions and analyze responses instantly',
  },
  {
    icon: Shield,
    title: 'Enterprise Secure',
    description: 'Bank-level security with encryption and compliance',
  },
]

const advancedFeatures = [
  {
    icon: GitBranch,
    title: 'Conditional Logic',
    description: 'Create dynamic forms with branching and skip logic based on user responses',
  },
  {
    icon: Palette,
    title: 'Design Customization',
    description: 'Full control over colors, typography, and button styles to match your brand',
  },
  {
    icon: Zap,
    title: 'Advanced Fields',
    description: 'Rating scales, matrix questions, file uploads, rich text, and sliders',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Invite team members with custom roles and manage permissions',
  },
  {
    icon: Code,
    title: 'Webhooks',
    description: 'Real-time integrations with your apps and services via webhooks',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Get instant alerts on new submissions and important form events',
  },
]

export default function Page() {
  return (
    <main className='min-h-screen bg-background'>
      <SiteHeader showAuth />

      <div className='relative overflow-hidden'>
        {/* Gradient background elements */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl'></div>
          <div className='absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl'></div>
        </div>

        <div className='relative py-20 md:py-32'>
          <PageContainer>
            <div className='flex flex-col items-center text-center gap-8'>
              <div className='inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20'>
                <Sparkles className='w-4 h-4 text-primary' />
                <span className='text-sm font-medium text-primary'>Next-generation form builder</span>
              </div>
              
              <div>
                <h1 className='text-5xl md:text-7xl font-bold text-foreground text-balance leading-tight'>
                  Build Forms That Convert
                </h1>
                <p className='text-xl text-muted-foreground mt-6 max-w-2xl mx-auto text-balance'>
                  Create stunning, responsive forms in minutes with our intuitive builder. No coding required. Real-time analytics included.
                </p>
              </div>

              <div className='flex gap-4 mt-8 flex-wrap justify-center'>
                <HomeHeroCta />
              </div>

              {/* Hero visual */}
              <div className='w-full mt-16 max-w-4xl'>
                <Card className='overflow-hidden border-0 shadow-2xl'>
                  <div className='h-64 md:h-96 bg-gradient-to-br from-primary/30 via-accent/20 to-background flex items-center justify-center'>
                    <div className='text-center'>
                      <ClipboardList className='w-24 h-24 text-primary/50 mx-auto mb-4' />
                      <p className='text-muted-foreground'>Your first form preview here</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </PageContainer>
        </div>
      </div>

      {/* Features section */}
      <div className='py-20 border-t border-border'>
        <PageContainer>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-foreground'>Why builders love FormBuilder</h2>
            <p className='text-muted-foreground mt-4 max-w-2xl mx-auto'>Built for teams that demand more from their forms</p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {coreFeatures.map((feature) => (
              <Card key={feature.title} className='border-border/50 hover:border-primary/30 transition-colors hover:shadow-lg'>
                <CardHeader>
                  <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors'>
                    <feature.icon className='w-6 h-6 text-primary' />
                  </div>
                  <CardTitle className='text-xl'>{feature.title}</CardTitle>
                  <CardDescription className='text-base'>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </PageContainer>
      </div>

      {/* Advanced Features Section */}
      <div className='py-20 bg-gradient-to-b from-muted/30 to-background'>
        <PageContainer>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-foreground'>Advanced Features</h2>
            <p className='text-muted-foreground mt-4 max-w-2xl mx-auto'>Everything you need to build sophisticated forms and collect meaningful data</p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {advancedFeatures.map((feature) => (
              <Card key={feature.title} className='border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:scale-105'>
                <CardHeader>
                  <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mb-4'>
                    <feature.icon className='w-6 h-6 text-primary' />
                  </div>
                  <CardTitle className='text-lg'>{feature.title}</CardTitle>
                  <CardDescription className='text-sm'>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </PageContainer>
      </div>

      {/* Stats section */}
      <div className='bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-y border-border py-16'>
        <PageContainer>
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='text-4xl md:text-5xl font-bold text-primary mb-2'>100K+</div>
              <p className='text-muted-foreground text-lg'>Forms Created</p>
            </div>
            <div className='text-center'>
              <div className='text-4xl md:text-5xl font-bold text-primary mb-2'>10M+</div>
              <p className='text-muted-foreground text-lg'>Responses Collected</p>
            </div>
            <div className='text-center'>
              <div className='text-4xl md:text-5xl font-bold text-primary mb-2'>99.9%</div>
              <p className='text-muted-foreground text-lg'>Uptime Guarantee</p>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* Forms section */}
      <PageContainer className='py-20'>
        <div className='mb-12'>
          <h2 className='text-3xl font-bold text-foreground mb-2'>Your Forms</h2>
          <p className='text-muted-foreground'>Manage all your forms in one place</p>
        </div>
        <FormsList />
      </PageContainer>

      {/* Final CTA section */}
      <div className='relative overflow-hidden py-20'>
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute bottom-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl'></div>
        </div>
        <PageContainer>
          <div className='relative text-center max-w-2xl mx-auto'>
            <h2 className='text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance'>
              Ready to create amazing forms?
            </h2>
            <p className='text-lg text-muted-foreground mb-8 text-balance'>
              Join thousands of teams using FormBuilder to collect responses that matter.
            </p>
            <Button 
              size='lg' 
              render={<Link href='/forms/new' />} 
              nativeButton={false}
              className='bg-primary hover:bg-primary/90 px-8'
            >
              Get Started Now
            </Button>
          </div>
        </PageContainer>
      </div>
    </main>
  )
}
