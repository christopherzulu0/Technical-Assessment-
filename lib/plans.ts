import type { Plan } from '@prisma/client'

export const FREE_FORM_LIMIT = 3

export const PLAN_FEATURES = {
  FREE: { forms: 3, webhooks: false, conditionalLogic: false, sso: false },
  STARTER: { forms: Infinity, webhooks: true, conditionalLogic: false, sso: false },
  PROFESSIONAL: { forms: Infinity, webhooks: true, conditionalLogic: true, sso: true },
  ENTERPRISE: { forms: Infinity, webhooks: true, conditionalLogic: true, sso: true },
} as const

export function getPlanLabel(plan: Plan) {
  const labels: Record<Plan, string> = {
    FREE: 'Free',
    STARTER: 'Starter',
    PROFESSIONAL: 'Professional',
    ENTERPRISE: 'Enterprise',
  }
  return labels[plan]
}
