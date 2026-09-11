import { NextResponse, type NextRequest } from 'next/server'
import { buildAssessmentData } from '@/lib/export/build-assessment-data'

type Params = { params: Promise<{ id: string }> }

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const data = await buildAssessmentData(id)
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ error: 'Google Docs export is not configured. Add Google Drive credentials to enable it.' }, { status: 501 })
  } catch (cause) {
    if (cause instanceof Error && cause.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: cause instanceof Error ? cause.message : 'Google Docs export failed' }, { status: 500 })
  }
}
