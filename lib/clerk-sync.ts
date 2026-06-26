import type { MemberRole, Plan } from '@prisma/client'
import { db } from '@/lib/db'

function normalizeSlug(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }
  if (typeof value === 'number') {
    return String(value)
  }
  return undefined
}

export function extractPlanSlugFromClerkRecord(data: any): string | undefined {
  if (!data) return undefined

  console.log('[extractPlanSlug] input data:', JSON.stringify(data, null, 2))

  const candidates = [
    data.public_metadata?.planSlug,
    data.private_metadata?.planSlug,
    data.public_metadata?.subscriptionPlan,
    data.public_metadata?.plan,
    data.public_metadata?.tier,
    data.private_metadata?.plan,
    data.private_metadata?.tier,
    data.publicMetadata?.planSlug,
    data.privateMetadata?.planSlug,
    data.publicMetadata?.subscriptionPlan,
    data.publicMetadata?.plan,
    data.publicMetadata?.tier,
    data.privateMetadata?.plan,
    data.privateMetadata?.tier,
    data.subscription?.plan?.slug,
    data.subscription?.plan?.id,
    data.subscription?.tier,
    data.plan?.slug,
    data.plan?.id,
    data.plan?.name,
    data.items?.[0]?.plan?.slug,
    data.items?.[0]?.plan?.id,
    data.items?.[0]?.plan?.name,
    data.items?.[0]?.price?.product?.slug,
    data.items?.[0]?.price?.product?.id,
    data.items?.[0]?.price?.product?.metadata?.planSlug,
    data.items?.[0]?.price?.product?.metadata?.slug,
  ]

  console.log('[extractPlanSlug] candidates:', candidates)

  for (const candidate of candidates) {
    const slug = normalizeSlug(candidate)
    if (slug) {
      console.log('[extractPlanSlug] found slug:', slug)
      return slug
    }
  }

  console.log('[extractPlanSlug] no slug found, returning undefined')
  return undefined
}

export function mapClerkRoleToMemberRole(role: string): MemberRole {
  if (role === 'org:admin') return 'OWNER'
  if (role.includes('editor')) return 'EDITOR'
  return 'VIEWER'
}

export function mapPlanSlugToPlan(slug: string | undefined | null): Plan {
  if (!slug) return 'FREE'
  const normalized = slug.toLowerCase()
  if (normalized.includes('enterprise')) return 'ENTERPRISE'
  if (normalized.includes('professional') || normalized === 'pro' || normalized.includes('premium')) return 'PROFESSIONAL'
  if (normalized.includes('starter') || normalized.includes('basic')) return 'STARTER'
  if (normalized.includes('free')) return 'FREE'
  return 'FREE'
}

export async function upsertUserFromClerk(data: {
  clerkUserId: string
  email: string
  firstName?: string | null
  lastName?: string | null
  avatar?: string | null
}) {
  return db.user.upsert({
    where: { clerkUserId: data.clerkUserId },
    create: {
      clerkUserId: data.clerkUserId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatar,
    },
    update: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatar,
    },
  })
}

export async function upsertOrganizationFromClerk(data: {
  clerkOrgId: string
  name: string
  slug: string
  image?: string | null
  planSlug?: string | null
}) {
  return db.organization.upsert({
    where: { clerkOrgId: data.clerkOrgId },
    create: {
      clerkOrgId: data.clerkOrgId,
      name: data.name,
      slug: data.slug,
      image: data.image,
      logoUrl: data.image,
      ...(data.planSlug ? { plan: mapPlanSlugToPlan(data.planSlug) } : {}),
    },
    update: {
      name: data.name,
      slug: data.slug,
      image: data.image,
      logoUrl: data.image,
      ...(data.planSlug ? { plan: mapPlanSlugToPlan(data.planSlug) } : {}),
    },
  })
}

export async function upsertOrganizationMember(data: {
  clerkOrgId: string
  clerkUserId: string
  email: string
  role: string
}) {
  const organization = await db.organization.findUnique({
    where: { clerkOrgId: data.clerkOrgId },
  })

  if (!organization) return null

  return db.organizationMember.upsert({
    where: {
      organizationId_clerkUserId: {
        organizationId: organization.id,
        clerkUserId: data.clerkUserId,
      },
    },
    create: {
      organizationId: organization.id,
      clerkUserId: data.clerkUserId,
      email: data.email,
      role: mapClerkRoleToMemberRole(data.role),
      joinedAt: new Date(),
    },
    update: {
      email: data.email,
      role: mapClerkRoleToMemberRole(data.role),
      joinedAt: new Date(),
    },
  })
}

export async function deleteOrganizationMember(clerkOrgId: string, clerkUserId: string) {
  const organization = await db.organization.findUnique({
    where: { clerkOrgId },
  })

  if (!organization) return

  await db.organizationMember.deleteMany({
    where: {
      organizationId: organization.id,
      clerkUserId,
    },
  })
}

export async function updateOrganizationBilling(data: {
  clerkOrgId: string
  planSlug?: string | null
  subscriptionStatus?: string | null
  stripeSubscriptionId?: string | null
  stripeCustomerId?: string | null
}) {
  console.log('[updateOrganizationBilling] input:', JSON.stringify(data, null, 2))
  const organization = await db.organization.findUnique({
    where: { clerkOrgId: data.clerkOrgId },
  })

  console.log('[updateOrganizationBilling] found organization:', organization ? `${organization.id} (current plan: ${organization.plan})` : 'null')

  if (!organization) {
    console.error('[updateOrganizationBilling] organization not found, cannot update billing')
    return null
  }

  const mappedPlan = data.planSlug ? mapPlanSlugToPlan(data.planSlug) : undefined
  console.log('[updateOrganizationBilling] mapped plan:', mappedPlan, 'from planSlug:', data.planSlug)

  const updateData: any = {
    ...(mappedPlan ? { plan: mappedPlan } : {}),
    ...(data.subscriptionStatus !== undefined
      ? { subscriptionStatus: data.subscriptionStatus }
      : {}),
    ...(data.stripeSubscriptionId !== undefined
      ? { stripeSubscriptionId: data.stripeSubscriptionId }
      : {}),
    ...(data.stripeCustomerId !== undefined
      ? { stripeCustomerId: data.stripeCustomerId }
      : {}),
  }

  console.log('[updateOrganizationBilling] update data:', JSON.stringify(updateData, null, 2))

  const result = await db.organization.update({
    where: { id: organization.id },
    data: updateData,
  })

  console.log('[updateOrganizationBilling] update result:', JSON.stringify(result, null, 2))
  return result
}
