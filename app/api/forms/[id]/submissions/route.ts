import { NextRequest, NextResponse } from 'next/server'
import { AuthError, requireFormOrgAccess } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/forms/[id]/submissions - Get all submissions for a form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[submissions] Fetching submissions for form:', id)
    
    const result = await requireFormOrgAccess(id)
    console.log('[submissions] Access granted for form:', id)

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'))
    const skip = (page - 1) * limit

    console.log('[submissions] Query params:', { page, limit, skip })

    const [submissions, total] = await Promise.all([
      db.formSubmission.findMany({
        where: { formId: id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.formSubmission.count({
        where: { formId: id },
      }),
    ])

    console.log('[submissions] Found submissions:', submissions.length, 'total:', total)

    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[submissions] Error:', error)
    if (error instanceof AuthError) {
      console.error('[submissions] AuthError:', error.message, error.status)
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[submissions] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}
