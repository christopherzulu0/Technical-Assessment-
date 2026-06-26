import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import {
  deleteOrganizationMember,
  extractPlanSlugFromClerkRecord,
  updateOrganizationBilling,
  upsertOrganizationFromClerk,
  upsertOrganizationMember,
  upsertUserFromClerk,
} from '@/lib/clerk-sync'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let evt

  try {
    const payload = await req.text()
    const headers = new Headers(req.headers)
    const verificationRequest = new Request(req.url, {
      method: req.method,
      headers,
      body: payload,
    })

    evt = await verifyWebhook(verificationRequest as any)
    console.log(`[webhook] verified event=${evt.type}`)
  } catch (err) {
    console.error('[webhook] Verification failed:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  }

  try {
    switch (evt.type) {
      case 'user.created':
      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data
        const email = email_addresses[0]?.email_address
        if (!email) break
        await upsertUserFromClerk({
          clerkUserId: id,
          email,
          firstName: first_name,
          lastName: last_name,
          avatar: image_url,
        })
        break
      }
      case 'user.deleted': {
        const { id } = evt.data
        await db.user.deleteMany({ where: { clerkUserId: id } })
        break
      }
      case 'organization.created':
      case 'organization.updated': {
        const { id, name, slug, image_url } = evt.data as any
        console.log('[webhook] organization.created/updated data:', JSON.stringify(evt.data, null, 2))
        const planSlug = extractPlanSlugFromClerkRecord(evt.data)
        console.log('[webhook] organization.created/updated extracted planSlug:', planSlug)
        const result = await upsertOrganizationFromClerk({
          clerkOrgId: id,
          name,
          slug: slug || id,
          image: image_url,
          planSlug,
        })
        console.log('[webhook] organization.created/updated result:', JSON.stringify(result, null, 2))
        break
      }
      case 'organization.deleted': {
        const { id } = evt.data
        await db.organization.deleteMany({ where: { clerkOrgId: id } })
        break
      }
      case 'organizationMembership.created':
      case 'organizationMembership.updated': {
        const { organization, public_user_data, role } = evt.data
        await upsertOrganizationMember({
          clerkOrgId: organization.id,
          clerkUserId: public_user_data.user_id,
          email: public_user_data.identifier || '',
          role,
        })
        break
      }
      case 'organizationMembership.deleted': {
        const { organization, public_user_data } = evt.data
        await deleteOrganizationMember(organization.id, public_user_data.user_id)
        break
      }
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.active':
      case 'subscription.pastDue':
      case 'subscription.renewed':
      case 'subscription.canceled': {
        const data = evt.data as any
        console.log('[webhook] subscription event data:', JSON.stringify(data, null, 2))
        const clerkOrgId = data.payer?.organization_id || data.organization_id || data.organization?.id
        console.log('[webhook] extracted clerkOrgId:', clerkOrgId)
        if (!clerkOrgId) break
        const planSlug = extractPlanSlugFromClerkRecord(data)
        console.log('[webhook] extracted planSlug:', planSlug)

        const organization = await db.organization.findUnique({
          where: { clerkOrgId },
        })
        console.log('[webhook] found organization:', organization ? `${organization.id} (plan: ${organization.plan})` : 'null')
        if (!organization) {
          try {
            const client = await clerkClient()
            const clerkOrg = await client.organizations.getOrganization({
              organizationId: clerkOrgId,
            })
            console.log('[webhook] fetched clerk org:', JSON.stringify(clerkOrg, null, 2))
            await upsertOrganizationFromClerk({
              clerkOrgId,
              name: clerkOrg.name,
              slug: clerkOrg.slug || clerkOrgId,
              image: clerkOrg.imageUrl,
              planSlug: extractPlanSlugFromClerkRecord(clerkOrg),
            })
          } catch (error) {
            console.error(`[webhook] fallback org sync failed for ${clerkOrgId}:`, error)
            await upsertOrganizationFromClerk({
              clerkOrgId,
              name: clerkOrgId,
              slug: clerkOrgId,
              image: null,
            })
          }
        }

        const updateResult = await updateOrganizationBilling({
          clerkOrgId,
          planSlug,
          subscriptionStatus: data.status ?? null,
          stripeSubscriptionId: data.id,
        })
        console.log('[webhook] billing update result:', JSON.stringify(updateResult, null, 2))
        break
      }
      case 'subscriptionItem.canceled':
      case 'subscriptionItem.ended': {
        const { payer } = evt.data as {
          payer?: { organization_id?: string }
        }
        console.log('[webhook] subscriptionItem.canceled/ended data:', JSON.stringify(evt.data, null, 2))
        const clerkOrgId = payer?.organization_id
        console.log('[webhook] subscriptionItem.canceled/ended clerkOrgId:', clerkOrgId)
        if (!clerkOrgId) break
        const updateResult = await updateOrganizationBilling({
          clerkOrgId,
          planSlug: 'free_org',
          subscriptionStatus: 'canceled',
        })
        console.log('[webhook] subscriptionItem.canceled/ended update result:', JSON.stringify(updateResult, null, 2))
        break
      }
      case 'subscriptionItem.active':
      case 'subscriptionItem.updated': {
        const data = evt.data as any
        console.log('[webhook] subscriptionItem.active/updated data:', JSON.stringify(data, null, 2))
        const clerkOrgId = data.payer?.organization_id || data.organization_id || data.organization?.id
        console.log('[webhook] subscriptionItem.active/updated clerkOrgId:', clerkOrgId)
        if (!clerkOrgId) break

        const organization = await db.organization.findUnique({
          where: { clerkOrgId },
        })
        console.log('[webhook] subscriptionItem.active/updated found organization:', organization ? `${organization.id} (plan: ${organization.plan})` : 'null')
        if (!organization) {
          try {
            const client = await clerkClient()
            const clerkOrg = await client.organizations.getOrganization({
              organizationId: clerkOrgId,
            })
            console.log('[webhook] subscriptionItem.active/updated fetched clerk org:', JSON.stringify(clerkOrg, null, 2))
            await upsertOrganizationFromClerk({
              clerkOrgId,
              name: clerkOrg.name,
              slug: clerkOrg.slug || clerkOrgId,
              image: clerkOrg.imageUrl,
              planSlug: extractPlanSlugFromClerkRecord(clerkOrg),
            })
          } catch (error) {
            console.error(`[webhook] fallback org sync failed for ${clerkOrgId}:`, error)
            await upsertOrganizationFromClerk({
              clerkOrgId,
              name: clerkOrgId,
              slug: clerkOrgId,
              image: null,
            })
          }
        }

        const planSlug = extractPlanSlugFromClerkRecord(data)
        console.log('[webhook] subscriptionItem.active/updated extracted planSlug:', planSlug)
        const updateResult = await updateOrganizationBilling({
          clerkOrgId,
          planSlug,
          subscriptionStatus: data.status ?? 'active',
        })
        console.log('[webhook] subscriptionItem.active/updated update result:', JSON.stringify(updateResult, null, 2))
        break
      }
      default:
        break
    }
  } catch (err) {
    console.error(`[webhook] Error handling ${evt.type}:`, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
