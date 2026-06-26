import { requireOrgAccess } from '@/lib/auth'
import { db } from '@/lib/db'

export async function getDashboardStats(clerkOrgId: string, isApi: boolean = false) {
  const { organization } = await requireOrgAccess(clerkOrgId, isApi)

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

  return { totalForms, totalResponses, teamMembers, avgCompletion }
}
