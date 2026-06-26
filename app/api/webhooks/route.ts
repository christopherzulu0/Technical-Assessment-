import { NextRequest, NextResponse } from 'next/server'
import { AuthError, requireAuth, requireOrgAccess } from '@/lib/auth'
import { db } from '@/lib/db'
import { resolveRequestedOrganizationId } from '@/lib/request-org'

function mapWebhookForResponse(webhook: {
  id: string
  url: string
  events: string[]
  isActive: boolean
  createdAt: Date
}) {
  return {
    id: webhook.id,
    url: webhook.url,
    events: webhook.events,
    active: webhook.isActive,
    createdAt: webhook.createdAt.toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { orgId: authOrgId } = await requireAuth()
    const orgId = resolveRequestedOrganizationId(request.headers.get('x-organization-id'), authOrgId)

    if (!orgId) {
      return NextResponse.json({ error: 'No active organization' }, { status: 400 })
    }

    const { organization } = await requireOrgAccess(orgId, true)
    const webhooks = await db.webhook.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(webhooks.map(mapWebhookForResponse))
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[webhooks] fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[webhooks] POST start')
    const { orgId: authOrgId } = await requireAuth()
    const orgId = resolveRequestedOrganizationId(request.headers.get('x-organization-id'), authOrgId)
    console.log('[webhooks] requireAuth ok', { orgId })

    if (!orgId) {
      return NextResponse.json({ error: 'No active organization' }, { status: 400 })
    }

    const { organization } = await requireOrgAccess(orgId, true)
    console.log('[webhooks] requireOrgAccess ok', { organizationId: organization.id })
    const body = await request.json()
    console.log('[webhooks] body', body)
    const url = typeof body?.url === 'string' ? body.url.trim() : ''
    const events = Array.isArray(body?.events)
      ? body.events.map((event: unknown) => String(event).trim()).filter(Boolean)
      : []

    if (!url || events.length === 0) {
      return NextResponse.json({ error: 'Webhook URL and events are required' }, { status: 400 })
    }

    console.log('[webhooks] creating record', { organizationId: organization.id, url, events })
    const webhook = await db.webhook.create({
      data: {
        organizationId: organization.id,
        url,
        events,
        isActive: true,
      },
    })
    console.log('[webhooks] created record', webhook.id)

    return NextResponse.json(mapWebhookForResponse(webhook))
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[webhooks] create error:', error)
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { orgId: authOrgId } = await requireAuth()
    const orgId = resolveRequestedOrganizationId(request.headers.get('x-organization-id'), authOrgId)

    if (!orgId) {
      return NextResponse.json({ error: 'No active organization' }, { status: 400 })
    }

    const { organization } = await requireOrgAccess(orgId, true)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Webhook id is required' }, { status: 400 })
    }

    await db.webhook.deleteMany({
      where: {
        id,
        organizationId: organization.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[webhooks] delete error:', error)
    return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 })
  }
}
