import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { MemberRole } from '@prisma/client'
import { db } from '@/lib/db'
import { extractPlanSlugFromClerkRecord, upsertOrganizationFromClerk } from '@/lib/clerk-sync'

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}

export async function requireAuth() {
  const { userId, orgId } = await auth()
  if (!userId) {
    throw new AuthError(401, 'Unauthorized')
  }
  return { userId, orgId: orgId ?? null }
}

export async function resolveOrganizationId() {
  const { userId, orgId: clerkOrgId } = await auth()
  if (!userId) return null

  if (!clerkOrgId) {
    const membership = await db.organizationMember.findFirst({
      where: { clerkUserId: userId },
      select: { organizationId: true },
    })
    return membership?.organizationId ?? null
  }

  let org = await db.organization.findUnique({
    where: { clerkOrgId },
    select: { id: true },
  })

  if (!org) {
    const client = await clerkClient()
    const clerkOrg = await client.organizations.getOrganization({ organizationId: clerkOrgId })
    
    // Fetch organization plan from Clerk metadata or subscription if available
    // Clerk Billing often stores subscription info in publicMetadata or we can check subscriptions
    const planSlug = extractPlanSlugFromClerkRecord(clerkOrg)
    const created = await upsertOrganizationFromClerk({
      clerkOrgId,
      name: clerkOrg.name,
      slug: clerkOrg.slug || clerkOrgId,
      image: clerkOrg.imageUrl,
      planSlug,
    })
    org = { id: created.id }
  }

  return org.id
}

export async function requireOrgAccess(clerkOrgId: string, isApi: boolean = false) {
  console.log(`requireOrgAccess: clerkOrgId=${clerkOrgId}, isApi=${isApi}`)
  const { userId } = await requireAuth()
  console.log(`requireOrgAccess: userId=${userId}`)

  let organization = await db.organization.findUnique({
    where: { clerkOrgId },
  })

  // Always sync organization details from Clerk when accessing to ensure plan and name are up to date
  const client = await clerkClient()
  try {
    const clerkOrg = await client.organizations.getOrganization({ organizationId: clerkOrgId })
    console.log(`requireOrgAccess: fetched clerkOrg=${clerkOrg.name}`)
    console.log(`requireOrgAccess: clerkOrg metadata:`, JSON.stringify({
      publicMetadata: clerkOrg.publicMetadata,
      privateMetadata: clerkOrg.privateMetadata,
      subscription: (clerkOrg as any).subscription,
    }, null, 2))
    
    const planSlug = extractPlanSlugFromClerkRecord(clerkOrg)
    console.log(`requireOrgAccess: extracted planSlug=${planSlug}`)

    organization = await upsertOrganizationFromClerk({
      clerkOrgId,
      name: clerkOrg.name,
      slug: clerkOrg.slug || clerkOrgId,
      image: clerkOrg.imageUrl,
      planSlug,
    })
    console.log(`requireOrgAccess: upserted organizationId=${organization.id}, plan=${organization.plan}`)
  } catch (e: any) {
    console.error(`requireOrgAccess: failed to sync organization from Clerk`, e)
    // If it's a network/fetch error and we have the org in DB, continue with stale data
    if (organization && (e.message?.includes('fetch failed') || e.code === 'api_response_error')) {
      console.log(`requireOrgAccess: using stale organization data from DB due to Clerk API error`)
    } else if (!organization) {
      if (isApi) throw new AuthError(404, 'Organization not found')
      redirect('/dashboard')
    }
  }

  let member = await db.organizationMember.findUnique({
    where: {
      organizationId_clerkUserId: {
        organizationId: organization.id,
        clerkUserId: userId,
      },
    },
  })

  if (!member) {
    console.log(`requireOrgAccess: member not found in DB, fetching from Clerk`)
    const client = await clerkClient()
    try {
      const memberships = await client.organizations.getOrganizationMembershipList({
        organizationId: clerkOrgId,
      })
      const clerkMembership = memberships.data.find((m) => m.publicUserData?.userId === userId)

      if (!clerkMembership) {
        console.log(`requireOrgAccess: userId=${userId} is not a member of clerkOrgId=${clerkOrgId}`)
        if (isApi) throw new AuthError(403, 'Forbidden')
        redirect('/dashboard')
      }

    member = await db.organizationMember.upsert({
      where: {
        organizationId_clerkUserId: {
          organizationId: organization.id,
          clerkUserId: userId,
        },
      },
      create: {
        organizationId: organization.id,
        clerkUserId: userId,
        email: clerkMembership.publicUserData?.identifier || '',
        role: mapClerkRole(clerkMembership.role),
        joinedAt: new Date(),
      },
      update: {
        email: clerkMembership.publicUserData?.identifier || '',
        role: mapClerkRole(clerkMembership.role),
      },
    })
    console.log(`requireOrgAccess: upserted memberId=${member.id}, role=${member.role}`)
    } catch (e) {
      console.error(`requireOrgAccess: failed to fetch/create member`, e)
      if (isApi) throw new AuthError(403, 'Forbidden')
      redirect('/dashboard')
    }
  }

  return { organization, member }
}

export async function requireEditorAccess(clerkOrgId: string) {
  const { member, organization } = await requireOrgAccess(clerkOrgId)
  if (member.role === 'VIEWER') {
    throw new AuthError(403, 'Forbidden')
  }
  return { organization, member }
}

export async function requireFormEditorAccess(formId: string) {
  const { userId } = await requireAuth()
  const form = await db.form.findUnique({
    where: { id: formId },
    include: { organization: true },
  })

  if (!form) {
    throw new AuthError(404, 'Form not found')
  }

  const member = await db.organizationMember.findUnique({
    where: {
      organizationId_clerkUserId: {
        organizationId: form.organizationId,
        clerkUserId: userId,
      },
    },
  })

  if (!member || member.role === 'VIEWER') {
    throw new AuthError(403, 'Forbidden')
  }

  return { form, member }
}

export async function requireFormOrgAccess(formId: string) {
  const { userId } = await requireAuth()
  const form = await db.form.findUnique({
    where: { id: formId },
    include: { organization: true },
  })

  if (!form) {
    throw new AuthError(404, 'Form not found')
  }

  const member = await db.organizationMember.findUnique({
    where: {
      organizationId_clerkUserId: {
        organizationId: form.organizationId,
        clerkUserId: userId,
      },
    },
  })

  if (!member) {
    throw new AuthError(403, 'Forbidden')
  }

  return { form, member }
}

function mapClerkRole(role: string): MemberRole {
  if (role === 'org:admin') return 'OWNER'
  if (role.includes('editor')) return 'EDITOR'
  return 'VIEWER'
}
