'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization, useOrganizationList } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Plus } from 'lucide-react'

export function OrgSwitcher() {
  const router = useRouter()
  const { organization: activeOrg } = useOrganization()
  const { userMemberships, setActive, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  })
  const [open, setOpen] = useState(false)

  const memberships = userMemberships.data ?? []

  if (!isLoaded) {
    return <div className='h-10 w-32 bg-muted rounded-lg animate-pulse' />
  }

  const currentOrg = activeOrg ?? memberships[0]?.organization

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='gap-2'>
          <div className='w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center'>
            {currentOrg?.imageUrl ? (
              <img src={currentOrg.imageUrl} alt={currentOrg.name} className='w-full h-full rounded-full' />
            ) : (
              <span className='text-xs font-semibold text-primary'>
                {currentOrg?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className='hidden md:inline text-sm font-medium'>{currentOrg?.name}</span>
          <ChevronDown className='w-4 h-4 text-muted-foreground' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-56'>
        <DropdownMenuLabel className='text-xs text-muted-foreground'>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {memberships.map((membership) => {
          const org = membership.organization
          return (
            <DropdownMenuItem
              key={org.id}
              onClick={async () => {
                await setActive({ organization: org.id })
                router.push(`/dashboard/${org.id}`)
              }}
              className='cursor-pointer'
            >
              <div className='w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0'>
                {org.imageUrl ? (
                  <img src={org.imageUrl} alt={org.name} className='w-full h-full rounded-full' />
                ) : (
                  <span className='text-xs font-semibold text-primary'>
                    {org.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className='flex-1 text-sm'>{org.name}</span>
              {currentOrg?.id === org.id && (
                <span className='text-primary text-xs font-semibold'>Current</span>
              )}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push('/onboarding')}
          className='cursor-pointer text-primary'
        >
          <Plus className='w-4 h-4 mr-2' />
          Create organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
