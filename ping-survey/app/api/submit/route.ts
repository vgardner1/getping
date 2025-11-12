/**
 * API Route: POST /api/submit
 *
 * Handles survey submission with validation, webhook forwarding, and local persistence
 */

import { NextRequest, NextResponse } from 'next/server'
import { SurveyPayloadSchema } from '@/lib/types'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

// Track submitted UUIDs to prevent duplicates (in-memory for serverless)
const submittedIds = new Set<string>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate payload with Zod
    const validation = SurveyPayloadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid submission data',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const payload = validation.data

    // Check for duplicate submission
    if (submittedIds.has(payload.uuid)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Duplicate submission',
        },
        { status: 409 }
      )
    }

    // Mark as submitted
    submittedIds.add(payload.uuid)

    // Forward to webhook if configured
    const webhookUrl = process.env.AIRTABLE_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL

    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!webhookResponse.ok) {
          console.error('Webhook forward failed:', await webhookResponse.text())
        }
      } catch (error) {
        console.error('Webhook error:', error)
        // Don't fail the request if webhook fails
      }
    }

    // Save to local file in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const dataDir = join(process.cwd(), 'data', 'submissions')
        await mkdir(dataDir, { recursive: true })

        const filePath = join(dataDir, `${payload.uuid}.json`)
        await writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8')
      } catch (error) {
        console.error('Local save error:', error)
        // Don't fail the request if local save fails
      }
    }

    // Return success
    return NextResponse.json({
      ok: true,
      data: {
        id: payload.uuid,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Submission error:', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
