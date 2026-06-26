import { NextRequest, NextResponse } from 'next/server'
import { AuthError, requireOrgAccess } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId')

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 })
    }

    const { organization } = await requireOrgAccess(orgId, true)

    const [totalForms, totalResponses, teamMembers, pageViews] = await Promise.all([
      db.form.count({ where: { organizationId: organization.id } }),
      db.formSubmission.count({ where: { form: { organizationId: organization.id } } }),
      db.organizationMember.count({ where: { organizationId: organization.id } }),
      db.form.aggregate({
        where: { organizationId: organization.id },
        _sum: { pageViews: true },
      }),
    ])

    const views = pageViews._sum.pageViews ?? 0
    const adjustedViews = Math.max(views, totalResponses)
    const avgCompletion = adjustedViews > 0 ? Math.round((totalResponses / adjustedViews) * 100) : 0

    return NextResponse.json({ totalForms, totalResponses, teamMembers, avgCompletion })
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[v0] GET /api/dashboard/stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
