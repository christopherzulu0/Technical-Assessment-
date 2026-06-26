'use client'

import Link from 'next/link'
import { Show, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export function AuthHeaderActions() {
  return (
    <>
      <Show when='signed-out'>
        <Button variant='ghost' render={<Link href='/sign-in' />} nativeButton={false}>
          Sign in
        </Button>
        <Button render={<Link href='/sign-up' />} nativeButton={false} className='bg-primary hover:bg-primary/90'>
          Sign up
        </Button>
      </Show>
      <Show when='signed-in'>
        <Button variant='ghost' render={<Link href='/dashboard' />} nativeButton={false}>
          Dashboard
        </Button>
        <UserButton />
      </Show>
    </>
  )
}
