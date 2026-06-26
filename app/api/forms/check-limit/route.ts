import { NextRequest, NextResponse } from 'next/server'
import { AuthError, resolveOrganizationId } from '@/lib/auth'
import { db } from '@/lib/db'
import { canCreateForm, getOrganizationPlan } from '@/lib/entitlements'
import { FREE_FORM_LIMIT, PLAN_FEATURES, getPlanLabel } from '@/lib/plans'

// GET /api/forms/check-limit - Check if user can create a form
export async function GET(request: NextRequest) {
  try {
    const organizationId = await resolveOrganizationId()

    if (!organizationId) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 400 }
      )
    }

    const plan = await getOrganizationPlan(organizationId)
    const limits = PLAN_FEATURES[plan]
    const currentCount = await db.form.count({ where: { organizationId } })
    const limit = limits.forms === Infinity ? 'Unlimited' : limits.forms

    const check = await canCreateForm(organizationId)

    return NextResponse.json({
      allowed: check.allowed,
      reason: check.reason,
      currentForms: currentCount,
      limit,
      plan: getPlanLabel(plan),
    })
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[check-limit] error:', error)
    return NextResponse.json({ error: 'Failed to check limit' }, { status: 500 })
  }
}
