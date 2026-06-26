'use client'

import { OrganizationProfile } from '@clerk/nextjs'
import { PageContainer } from '@/components/page-container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function MembersPage() {
  return (
    <PageContainer className='py-12'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-foreground'>Team Members</h1>
        <p className='text-muted-foreground mt-2'>
          Invite teammates and manage roles for your organization
        </p>
      </div>

      <Card className='border-border/50 shadow-sm'>
        <CardHeader>
          <CardTitle>Organization Members</CardTitle>
          <CardDescription>
            Use Clerk to invite members, assign roles, and manage access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationProfile routing='hash' />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
