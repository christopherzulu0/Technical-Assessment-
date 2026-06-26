import { Badge } from '@/components/ui/badge'
import { getPlanLabel } from '@/lib/plans'
import type { Plan } from '@prisma/client'

interface PlanBadgeProps {
  plan: Plan
}

export function PlanBadge({ plan }: PlanBadgeProps) {
  return (
    <Badge variant='secondary' className='bg-primary/10 text-primary border-primary/20'>
      {getPlanLabel(plan)}
    </Badge>
  )
}
