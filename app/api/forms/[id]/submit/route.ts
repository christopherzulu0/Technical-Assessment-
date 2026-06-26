import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateFormSubmission } from '@/lib/validators'

// POST /api/forms/[id]/submit - Submit form response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Get form with schema
    const form = await db.form.findUnique({
      where: { id },
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Get JSON Schema from stored form definition
    const schemaData = form.schema as any
    const jsonSchema = schemaData.jsonSchema

    // Validate submission data
    const validation = validateFormSubmission(jsonSchema, body)

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    // Store submission
    const submission = await db.formSubmission.create({
      data: {
        formId: id,
        data: body,
        schemaSnapshot: form.schema as any,
      },
    })

    return NextResponse.json(
      {
        success: true,
        submissionId: submission.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] POST /api/forms/[id]/submit error:', error)
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 })
  }
}
