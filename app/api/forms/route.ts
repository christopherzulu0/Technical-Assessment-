import { NextRequest, NextResponse } from 'next/server'
import { AuthError, resolveOrganizationId, requireOrgAccess } from '@/lib/auth'
import { db } from '@/lib/db'
import { canCreateForm } from '@/lib/entitlements'
import { formSchemaValidation, generateJsonSchema } from '@/lib/validators'

// GET /api/forms - List all forms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId')
    
    let organizationId: string | null = null
    
    if (orgId) {
      const { organization } = await requireOrgAccess(orgId, true)
      organizationId = organization.id
    } else {
      organizationId = await resolveOrganizationId()
    }

    if (!organizationId) {
      return NextResponse.json([])
    }

    const forms = await db.form.findMany({
      where: { organizationId },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(forms)
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[v0] GET /api/forms error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch forms',
        details: error?.message || String(error),
      },
      { status: 500 }
    )
  }
}

// POST /api/forms - Create new form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validationResult = formSchemaValidation.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid form schema', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const formDef = validationResult.data
    const organizationId = await resolveOrganizationId()

    if (!organizationId) {
      return NextResponse.json(
        { error: 'No organization found. Create or select an organization first.' },
        { status: 400 }
      )
    }

    const createCheck = await canCreateForm(organizationId)
    if (!createCheck.allowed) {
      return NextResponse.json(
        { error: createCheck.reason, upgradeRequired: true },
        { status: 403 }
      )
    }

    const jsonSchema = generateJsonSchema(formDef)

    const form = await db.form.create({
      data: {
        organizationId,
        title: formDef.title,
        description: formDef.description || null,
        schema: {
          ...formDef,
          jsonSchema,
        },
      },
    })

    return NextResponse.json(form, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[v0] POST /api/forms error:', error)
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 })
  }
}
