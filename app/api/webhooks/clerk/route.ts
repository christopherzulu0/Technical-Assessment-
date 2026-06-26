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

        // Always fetch the organization from Clerk to get the most accurate plan information
        let finalPlanSlug = extractPlanSlugFromClerkRecord(data)
        console.log('[webhook] extracted planSlug from subscription data:', finalPlanSlug)

        try {
          const client = await clerkClient()
          const clerkOrg = await client.organizations.getOrganization({
            organizationId: clerkOrgId,
          })
          console.log('[webhook] fetched clerk org:', JSON.stringify(clerkOrg, null, 2))
          const clerkOrgPlanSlug = extractPlanSlugFromClerkRecord(clerkOrg)
          console.log('[webhook] extracted planSlug from clerk org:', clerkOrgPlanSlug)
          
          // Prefer the plan from the organization itself over the subscription data
          if (clerkOrgPlanSlug) {
            finalPlanSlug = clerkOrgPlanSlug
            console.log('[webhook] using planSlug from clerk org:', finalPlanSlug)
          }

          // Ensure organization exists in our DB with correct plan
          await upsertOrganizationFromClerk({
            clerkOrgId,
            name: clerkOrg.name,
            slug: clerkOrg.slug || clerkOrgId,
            image: clerkOrg.imageUrl,
            planSlug: finalPlanSlug,
          })
        } catch (error) {
          console.error(`[webhook] failed to fetch org from Clerk for ${clerkOrgId}:`, error)
          // Fallback: try to create org with plan from subscription data
          const organization = await db.organization.findUnique({
            where: { clerkOrgId },
          })
          if (!organization) {
            await upsertOrganizationFromClerk({
              clerkOrgId,
              name: clerkOrgId,
              slug: clerkOrgId,
              image: null,
              planSlug: finalPlanSlug,
            })
          }
        }

        const updateResult = await updateOrganizationBilling({
          clerkOrgId,
          planSlug: finalPlanSlug,
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

        // Always fetch the organization from Clerk to get the most accurate plan information
        let finalPlanSlug = extractPlanSlugFromClerkRecord(data)
        console.log('[webhook] subscriptionItem extracted planSlug from data:', finalPlanSlug)

        try {
          const client = await clerkClient()
          const clerkOrg = await client.organizations.getOrganization({
            organizationId: clerkOrgId,
          })
          console.log('[webhook] subscriptionItem fetched clerk org:', JSON.stringify(clerkOrg, null, 2))
          const clerkOrgPlanSlug = extractPlanSlugFromClerkRecord(clerkOrg)
          console.log('[webhook] subscriptionItem extracted planSlug from clerk org:', clerkOrgPlanSlug)
          
          // Prefer the plan from the organization itself over the subscriptionItem data
          if (clerkOrgPlanSlug) {
            finalPlanSlug = clerkOrgPlanSlug
            console.log('[webhook] subscriptionItem using planSlug from clerk org:', finalPlanSlug)
          }

          // Ensure organization exists in our DB with correct plan
          await upsertOrganizationFromClerk({
            clerkOrgId,
            name: clerkOrg.name,
            slug: clerkOrg.slug || clerkOrgId,
            image: clerkOrg.imageUrl,
            planSlug: finalPlanSlug,
          })
        } catch (error) {
          console.error(`[webhook] subscriptionItem failed to fetch org from Clerk for ${clerkOrgId}:`, error)
          // Fallback: try to create org with plan from subscriptionItem data
          const organization = await db.organization.findUnique({
            where: { clerkOrgId },
          })
          if (!organization) {
            await upsertOrganizationFromClerk({
              clerkOrgId,
              name: clerkOrgId,
              slug: clerkOrgId,
              image: null,
              planSlug: finalPlanSlug,
            })
          }
        }

        const updateResult = await updateOrganizationBilling({
          clerkOrgId,
          planSlug: finalPlanSlug,
          subscriptionStatus: data.status ?? 'active',
        })
        console.log('[webhook] subscriptionItem update result:', JSON.stringify(updateResult, null, 2))
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
