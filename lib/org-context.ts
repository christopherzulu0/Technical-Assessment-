import { getCurrentOrganization as requireOrg, requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function getCurrentOrganization(orgId?: string) {
  const clerkOrgId = orgId ?? (await requireAuth()).orgId
  if (!clerkOrgId) {
    throw new Error('No organization found')
  }
  const { organization } = await requireOrg(clerkOrgId)
  return organization
}

export async function getUserOrganizations() {
  const { userId } = await requireAuth()

  const organizations = await db.organizationMember.findMany({
    where: { clerkUserId: userId },
    include: { organization: true },
  })

  return organizations.map((m) => m.organization)
}

export async function getOrganizationMembers(organizationId: string) {
  const members = await db.organizationMember.findMany({
    where: { organizationId },
    orderBy: { joinedAt: 'desc' },
  })

  return members
}

export async function getOrganizationBySlug(slug: string) {
  const org = await db.organization.findUnique({
    where: { slug },
    include: {
      members: true,
    },
  })

  return org
}
