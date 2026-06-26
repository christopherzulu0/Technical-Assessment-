'use client'

import { PricingTable } from '@clerk/nextjs'

export function OrganizationPricingTable() {
  return (
    <div className='clerk-pricing-table'>
      <PricingTable for='organization' />
    </div>
  )
}
