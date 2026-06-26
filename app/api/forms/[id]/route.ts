import { NextRequest, NextResponse } from 'next/server'
import { AuthError, requireFormEditorAccess } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/forms/[id] - Get form details (public for form view page)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const form = await db.form.findUnique({
      where: { id },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    await db.form.update({
      where: { id },
      data: { pageViews: { increment: 1 } },
    })

    return NextResponse.json(form)
  } catch (error) {
    console.error('[v0] GET /api/forms/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 })
  }
}

// DELETE /api/forms/[id] - Delete form
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requireFormEditorAccess(id)

    await db.form.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[v0] DELETE /api/forms/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 })
  }
}
