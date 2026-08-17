import { NextResponse } from 'next/server'
import { getSiteTitle } from '@/app/(dashboard)/admin/actions'

/**
 * GET /api/site-title
 * Public endpoint returning the site title (admin "Site Title" option) used by
 * the public header. The value is cached server-side via getSiteTitle, so this
 * does not hit the DB on every page load. Falls back to "TTS Intake".
 */
export async function GET() {
  try {
    const title = await getSiteTitle()
    return NextResponse.json({ title }, { status: 200 })
  } catch (err) {
    console.error('Failed to load site title:', err)
    // Never fail the header — fall back to the default.
    return NextResponse.json({ title: 'TTS Intake' }, { status: 200 })
  }
}