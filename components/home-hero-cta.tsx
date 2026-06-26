'use client'

import Link from 'next/link'
import { Show } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export function HomeHeroCta() {
  return (
    <>
      <Show when='signed-out'>
        <Button size='lg' render={<Link href='/sign-up' />} nativeButton={false} className='bg-primary hover:bg-primary/90 px-8'>
          Get Started Free
        </Button>
        <Button size='lg' variant='outline' render={<Link href='/sign-in' />} nativeButton={false} className='px-8'>
          Sign In
        </Button>
      </Show>
      <Show when='signed-in'>
        <Button size='lg' render={<Link href='/dashboard' />} nativeButton={false} className='bg-primary hover:bg-primary/90 px-8'>
          Go to Dashboard
        </Button>
        <Button size='lg' variant='outline' render={<Link href='/forms/new' />} nativeButton={false} className='px-8'>
          Create Form
        </Button>
      </Show>
    </>
  )
}
