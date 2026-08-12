'use client'

// Resume Builder — client wrapper: autosave, export, AI panel, title editing.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ResumeEditor } from './ResumeEditor'
import { AiPanel } from './AiPanel'
import type { ResumeDoc } from '../lib/types'

interface Props {
  resumeId: string
  initialTitle: string
  initialDoc: ResumeDoc
}

export function ResumeEditorClient({
  resumeId,
  initialTitle,
  initialDoc,
}: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [doc, setDoc] = useState<ResumeDoc>(initialDoc)
  const [aiOpen, setAiOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const docRef = useRef(doc)
  docRef.current = doc
  const titleRef = useRef(title)
  titleRef.current = title

  const save = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/app/resume-builder/api/resumes/${resumeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleRef.current,
          doc_json: docRef.current,
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Failed to save')
      }
      setSavedAt(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }, [resumeId])

  // Autosave with debounce on doc changes.
  useEffect(() => {
    const t = setTimeout(() => {
      save()
    }, 1500)
    return () => clearTimeout(t)
  }, [doc, save])

  async function handleExport() {
    setExporting(true)
    setError(null)
    try {
      const res = await fetch('/app/resume-builder/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc: docRef.current, title: titleRef.current }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Export failed')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${titleRef.current || 'resume'}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  function handleApplyAi(text: string) {
    // Insert AI output as a new paragraph at the end of the doc.
    const lines = text.split('\n').filter((l) => l.trim())
    const content = lines.map((line) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: line }],
    }))
    setDoc((prev) => ({
      type: 'doc',
      content: [...prev.content, ...content],
    }))
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => router.push('/app/resume-builder')}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
          title="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => save()}
          className="flex-1 font-medium text-gray-900 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1"
          placeholder="Untitled Resume"
        />
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {saving && (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </span>
          )}
          {savedAt && !saving && <span>Saved {savedAt}</span>}
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 text-sm text-red-600">{error}</div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <ResumeEditor
            initialDoc={doc}
            onDocChange={setDoc}
            onExport={handleExport}
            onOpenAi={() => setAiOpen(true)}
            exporting={exporting}
          />
        </div>
        <AiPanel
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          doc={doc}
          onApply={handleApplyAi}
        />
      </div>
    </div>
  )
}