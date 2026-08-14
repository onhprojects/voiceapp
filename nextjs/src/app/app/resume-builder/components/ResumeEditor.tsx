'use client'

// Resume Builder — Word-like TipTap editor.
import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { resumeExtensions } from '../lib/editor-schema'
import type { ResumeDoc } from '../lib/types'
import { ResumeToolbar } from './ResumeToolbar'

interface Props {
  initialDoc: ResumeDoc
  onDocChange: (doc: ResumeDoc) => void
  onExport: () => void
  onOpenAi: () => void
  exporting?: boolean
}

export function ResumeEditor({
  initialDoc,
  onDocChange,
  onExport,
  onOpenAi,
  exporting,
}: Props) {
  const onDocChangeRef = useRef(onDocChange)
  onDocChangeRef.current = onDocChange

  const editor = useEditor({
    extensions: resumeExtensions,
    content: initialDoc,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[600px] px-8 py-10',
      },
    },
    onUpdate: ({ editor }) => {
      onDocChangeRef.current(editor.getJSON() as ResumeDoc)
    },
  })

  // Keep the editor in sync if the loaded doc changes (e.g. template switch).
  useEffect(() => {
    if (editor && initialDoc) {
      const current = editor.getJSON()
      if (JSON.stringify(current) !== JSON.stringify(initialDoc)) {
        editor.commands.setContent(initialDoc)
      }
    }
  }, [editor, initialDoc])

  return (
    <div className="flex flex-col h-full">
      <ResumeToolbar
        editor={editor}
        onExport={onExport}
        onOpenAi={onOpenAi}
        exporting={exporting}
      />
      <div className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-8">
        <div className="mx-auto max-w-[8.5in] bg-white shadow-lg rounded-sm min-h-[11in]">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}