'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { OrganizationSwitcher, UserButton } from '@clerk/nextjs'
import { PlanBadge } from '@/components/billing/plan-badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Plan } from '@prisma/client'

interface DashboardNavProps {
  orgId: string
  plan: Plan
}

export function DashboardNav({ orgId, plan }: DashboardNavProps) {
  const pathname = usePathname()

  const links = [
    { href: `/dashboard/${orgId}`, label: 'Forms' },
    { href: `/dashboard/${orgId}/settings`, label: 'Settings' },
    { href: `/dashboard/${orgId}/members`, label: 'Members' },
  ]

  return (
    <header className='border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex items-center gap-4 min-w-0'>
          <Link href='/' className='flex items-center gap-2 shrink-0 group'>
            <div className='w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg'>
              <span className='text-primary-foreground font-bold text-sm'>FB</span>
            </div>
            <span className='font-bold text-foreground hidden sm:inline text-lg'>FormBuilder</span>
          </Link>
          <OrganizationSwitcher
            afterSelectOrganizationUrl='/dashboard/:id'
            afterCreateOrganizationUrl='/dashboard/:id'
            hidePersonal
          />
          <PlanBadge plan={plan} />
        </div>

        <nav className='flex items-center gap-2 overflow-x-auto'>
          {links.map((link) => (
            <Button
              key={link.href}
              variant={pathname === link.href ? 'secondary' : 'ghost'}
              size='sm'
              render={<Link href={link.href} />}
              nativeButton={false}
              className={cn(pathname === link.href && 'bg-primary/10 text-primary')}
            >
              {link.label}
            </Button>
          ))}
          <Button
            size='sm'
            render={<Link href='/pricing' />}
            nativeButton={false}
            className='bg-primary hover:bg-primary/90'
          >
            Upgrade
          </Button>
          <UserButton />
        </nav>
      </div>
    </header>
  )
}
