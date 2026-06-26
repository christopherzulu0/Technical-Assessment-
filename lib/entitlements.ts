import { auth } from '@clerk/nextjs/server'
import type { Plan } from '@prisma/client'
import { db } from '@/lib/db'
import { FREE_FORM_LIMIT, PLAN_FEATURES } from '@/lib/plans'

export async function getOrganizationPlan(organizationId: string): Promise<Plan> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { plan: true },
  })
  return org?.plan ?? 'FREE'
}

export async function canCreateForm(organizationId: string) {
  const plan = await getOrganizationPlan(organizationId)
  const limits = PLAN_FEATURES[plan]

  if (limits.forms === Infinity) {
    return { allowed: true as const }
  }

  const count = await db.form.count({ where: { organizationId } })
  if (count >= FREE_FORM_LIMIT) {
    return {
      allowed: false as const,
      reason: `Free plan is limited to ${FREE_FORM_LIMIT} forms. Upgrade to create more.`,
    }
  }

  return { allowed: true as const }
}

export async function hasFeature(
  feature: 'webhooks' | 'conditional_logic' | 'sso'
) {
  const { has, orgId } = await auth()

  if (has) {
    const featureSlug =
      feature === 'conditional_logic' ? 'conditional_logic' : feature
    if (has({ feature: featureSlug })) return true
  }

  if (!orgId) return false

  const org = await db.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: { plan: true },
  })

  if (!org) return false

  const limits = PLAN_FEATURES[org.plan]
  if (feature === 'webhooks') return limits.webhooks
  if (feature === 'conditional_logic') return limits.conditionalLogic
  if (feature === 'sso') return limits.sso
  return false
}
