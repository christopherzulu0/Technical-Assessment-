'use client'

import { useOrganizationList } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  })
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    const memberships = userMemberships.data ?? []

    if (memberships.length === 0) {
      // If we've loaded and there's definitely no memberships, then redirect
      if (!userMemberships.isLoading && !userMemberships.hasNextPage) {
        router.replace('/onboarding')
      }
      return
    }

    router.replace(`/dashboard/${memberships[0].organization.id}`)
  }, [isLoaded, userMemberships.data, userMemberships.isLoading, userMemberships.hasNextPage, router])

  return (
    <div className='min-h-screen bg-background flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4' />
        <p className='text-muted-foreground'>Loading your organization...</p>
      </div>
    </div>
  )
}
