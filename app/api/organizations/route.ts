import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { AuthError, requireAuth } from '@/lib/auth'
import { extractPlanSlugFromClerkRecord, upsertOrganizationFromClerk, upsertOrganizationMember } from '@/lib/clerk-sync'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { userId } = await requireAuth()

    const memberships = await db.organizationMember.findMany({
      where: { clerkUserId: userId },
      include: { organization: true },
      orderBy: { joinedAt: 'desc' },
    })

    return NextResponse.json(
      memberships.map((m) => ({
        ...m.organization,
        role: m.role,
      }))
    )
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const { userId, orgId } = await requireAuth()

    if (!orgId) {
      return NextResponse.json({ error: 'No active organization' }, { status: 400 })
    }

    const client = await clerkClient()
    const clerkOrg = await client.organizations.getOrganization({ organizationId: orgId })
    const organization = await upsertOrganizationFromClerk({
      clerkOrgId: orgId,
      name: clerkOrg.name,
      slug: clerkOrg.slug || orgId,
      image: clerkOrg.imageUrl,
      planSlug: extractPlanSlugFromClerkRecord(clerkOrg),
    })

    const memberships = await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    })
    const membership = memberships.data.find((m) => m.publicUserData?.userId === userId)

    if (membership) {
      await upsertOrganizationMember({
        clerkOrgId: orgId,
        clerkUserId: userId,
        email: membership.publicUserData?.identifier || '',
        role: membership.role,
      })
    }

    return NextResponse.json(organization)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[organizations] sync error:', error)
    return NextResponse.json({ error: 'Failed to sync organization' }, { status: 500 })
  }
}
