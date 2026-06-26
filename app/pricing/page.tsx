import { SiteHeader } from '@/components/site-header'
import { PageContainer } from '@/components/page-container'
import { OrganizationPricingTable } from '@/components/billing/organization-pricing-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PricingPage() {
  return (
    <main className='min-h-screen bg-background'>
      <SiteHeader showAuth />

      <div className='relative overflow-hidden py-20'>
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl' />
        </div>

        <PageContainer>
          <div className='relative text-center max-w-3xl mx-auto'>
            <h1 className='text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance'>
              Simple, Transparent Pricing
            </h1>
            <p className='text-xl text-muted-foreground mb-8 text-balance'>
              Choose the perfect plan for your organization. Scale as you grow.
            </p>
          </div>
        </PageContainer>
      </div>

      <PageContainer className='py-16'>
        <Card className='border-border/50 shadow-lg'>
          <CardHeader>
            <CardTitle>Organization Plans</CardTitle>
            <CardDescription>
              Select a plan for your workspace. Checkout is handled securely by Clerk Billing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizationPricingTable />
          </CardContent>
        </Card>
      </PageContainer>

      <div className='bg-gradient-to-b from-muted/30 to-background py-20'>
        <PageContainer>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-foreground mb-4'>Frequently Asked Questions</h2>
            <p className='text-muted-foreground'>Have questions? We have answers</p>
          </div>

          <div className='grid md:grid-cols-2 gap-8 max-w-3xl mx-auto'>
            {[
              {
                q: 'Can I change plans anytime?',
                a: 'Yes. You can upgrade or downgrade your organization plan at any time.',
              },
              {
                q: 'Do you offer a free trial?',
                a: 'Start with the free organization plan and upgrade when you need more features.',
              },
              {
                q: 'Is there a contract?',
                a: 'No contracts. Plans are billed monthly through Clerk Billing.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'Clerk Billing supports major credit cards for organization subscriptions.',
              },
            ].map((faq) => (
              <div key={faq.q} className='bg-white rounded-lg p-6 border border-border/50'>
                <h3 className='font-semibold text-foreground mb-2'>{faq.q}</h3>
                <p className='text-sm text-muted-foreground'>{faq.a}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </div>
    </main>
  )
}
