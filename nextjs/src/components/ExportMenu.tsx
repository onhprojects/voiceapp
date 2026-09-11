'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ExportMenuProps {
  assessmentId: string | null
  disabled?: boolean
  size?: 'sm' | 'default'
  variant?: 'default' | 'outline' | 'destructive'
  className?: string
}

type MenuFormat = 'pdf' | 'docx' | 'md' | 'google'

export function ExportMenu({ assessmentId, disabled, size = 'default', variant = 'default', className }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState<MenuFormat | null>(null)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (event: MouseEvent) => { if (!containerRef.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const exportFile = async (format: Exclude<MenuFormat, 'google'>) => {
    if (!assessmentId) return
    setExporting(format); setError(null); setOpen(false)
    try {
      const response = await fetch(`/audio-text-assessment/api/text-assessments/${assessmentId}/export?format=${format}`)
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Export failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a'); link.href = url; link.download = ''; link.click(); URL.revokeObjectURL(url)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Export failed') }
    finally { setExporting(null) }
  }

  const exportGoogleDoc = async () => {
    if (!assessmentId) return
    setExporting('google'); setError(null); setOpen(false)
    try {
      const response = await fetch(`/audio-text-assessment/api/text-assessments/${assessmentId}/export/google`, { method: 'POST' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Google Docs export is not configured')
      window.open(result.viewLink, '_blank', 'noopener,noreferrer')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Google Docs export failed') }
    finally { setExporting(null) }
  }

  const busy = exporting !== null
  return (
    <div ref={containerRef} className="relative">
      <Button type="button" size={size} variant={variant} className={className} disabled={disabled || busy} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {busy ? <Loader2 className="animate-spin" /> : <Download />}
        <span>Export</span><ChevronDown />
      </Button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 min-w-48 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
          <button role="menuitem" className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100" onClick={() => exportFile('pdf')}>PDF</button>
          <button role="menuitem" className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100" onClick={() => exportFile('docx')}>Word (.docx)</button>
          <button role="menuitem" className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100" onClick={() => exportFile('md')}>Markdown (.md)</button>
          <button role="menuitem" className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100" onClick={exportGoogleDoc}>Google Doc</button>
        </div>
      )}
      {error && <p role="alert" className={cn('absolute right-0 top-full z-50 mt-2 w-64 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700')}>{error}</p>}
    </div>
  )
}
