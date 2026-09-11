import { NextResponse, type NextRequest } from 'next/server'
import { buildAssessmentData } from '@/lib/export/build-assessment-data'
import { exportFilename } from '@/lib/export/filename'
import { renderDocx } from '@/lib/export/render-docx'
import { renderMarkdown } from '@/lib/export/render-markdown'
import { renderPdf } from '@/lib/export/render-pdf'
import type { ExportFormat } from '@/lib/export/types'

type Params = { params: Promise<{ id: string }> }

const contentTypes: Record<ExportFormat, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  md: 'text/markdown; charset=utf-8',
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const format = request.nextUrl.searchParams.get('format') as ExportFormat | null
    if (!format || !(format in contentTypes)) return NextResponse.json({ error: 'Unsupported export format' }, { status: 400 })

    const data = await buildAssessmentData(id)
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let body: string | Uint8Array
    if (format === 'md') body = renderMarkdown(data)
    else if (format === 'docx') body = renderDocx(data)
    else body = await renderPdf(data)

    return new NextResponse(body as BodyInit, {
      headers: {
        'Content-Type': contentTypes[format],
        'Content-Disposition': `attachment; filename="${exportFilename(data.name, format)}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (cause) {
    if (cause instanceof Error && cause.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: cause instanceof Error ? cause.message : 'Export failed' }, { status: 500 })
  }
}
