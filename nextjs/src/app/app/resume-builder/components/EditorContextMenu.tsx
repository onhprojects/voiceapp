'use client'

// Resume Builder — right-click context menu for the TipTap editor.
// Shows table operations when right-clicking inside a table, and common text
// actions otherwise. Positioned at the cursor, closes on outside click/Esc.
import { useEffect, useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import {
  Columns3,
  Rows3,
  Trash2,
  Table as TableIcon,
  TableProperties,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link,
  Link2Off,
  Copy,
  Scissors,
  Strikethrough,
} from 'lucide-react'

interface Props {
  editor: Editor | null
}

interface MenuState {
  x: number
  y: number
  inTable: boolean
}

function Item({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left rounded-md transition-colors disabled:opacity-40 ${
        danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

export function EditorContextMenu({ editor }: Props) {
  const [menu, setMenu] = useState<MenuState | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editor) return

    function onContextMenu(e: MouseEvent) {
      // Only open our menu for right-clicks inside the editor content.
      const target = e.target as HTMLElement
      const contentEl = editor.view.dom
      if (!contentEl.contains(target)) return
      e.preventDefault()
      // Determine whether the click landed inside a table cell.
      const inTable = !!target.closest('table')
      // Keep focus on the editor so the underlying selection is preserved.
      editor.commands.focus()
      setMenu({ x: e.clientX, y: e.clientY, inTable })
    }

    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenu(null)
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenu(null)
    }

    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [editor])

  if (!menu || !editor) return null

  const isActive = (name: string, attrs?: Record<string, unknown>) =>
    editor.isActive(name, attrs)

  const close = () => setMenu(null)

  const run = (fn: () => void) => {
    close()
    fn()
  }

  const doCopy = () => {
    run(() => document.execCommand('copy'))
  }
  const doCut = () => {
    run(() => document.execCommand('cut'))
  }

  const doLink = () => {
    const url = window.prompt('Enter link URL')?.trim()
    if (url) run(() => editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run())
    else close()
  }
  const doUnlink = () => run(() => editor.chain().focus().unsetLink().run())

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: menu.x,
    top: menu.y,
    transform: 'translateY(2px)',
    zIndex: 1000,
    minWidth: 200,
  }

  return (
    <div
      ref={ref}
      onContextMenu={(e) => e.preventDefault()}
      className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-sm"
      style={menuStyle}
    >
      {menu.inTable && (
        <>
          <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Table
          </div>
          <Item
            icon={<Rows3 className="h-4 w-4" />}
            label="Add row below"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          />
          <Item
            icon={<Rows3 className="h-4 w-4" />}
            label="Add row above"
            onClick={() => editor.chain().focus().addRowBefore().run()}
          />
          <Item
            icon={<Columns3 className="h-4 w-4" />}
            label="Add column right"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          />
          <Item
            icon={<Columns3 className="h-4 w-4" />}
            label="Add column left"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          />
          <Item
            icon={<Rows3 className="h-4 w-4" />}
            label="Delete row"
            onClick={() => editor.chain().focus().deleteRow().run()}
            danger
          />
          <Item
            icon={<Columns3 className="h-4 w-4" />}
            label="Delete column"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            danger
          />
          <Item
            icon={<TableProperties className="h-4 w-4" />}
            label="Toggle header row"
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          />
          <Item
            icon={<Trash2 className="h-4 w-4" />}
            label="Delete table"
            onClick={() => editor.chain().focus().deleteTable().run()}
            danger
          />
          <div className="my-1 border-t border-gray-100" />
        </>
      )}

      <Item
        icon={<Bold className="h-4 w-4" />}
        label="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <Item
        icon={<Italic className="h-4 w-4" />}
        label="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <Item
        icon={<UnderlineIcon className="h-4 w-4" />}
        label="Underline"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <Item
        icon={<Strikethrough className="h-4 w-4" />}
        label="Strikethrough"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />

      <div className="my-1 border-t border-gray-100" />

      <Item
        icon={<Link className="h-4 w-4" />}
        label="Add link"
        onClick={doLink}
      />
      <Item
        icon={<Link2Off className="h-4 w-4" />}
        label="Remove link"
        disabled={!isActive('link')}
        onClick={doUnlink}
      />

      <div className="my-1 border-t border-gray-100" />

      <Item icon={<Copy className="h-4 w-4" />} label="Copy" onClick={doCopy} />
      <Item icon={<Scissors className="h-4 w-4" />} label="Cut" onClick={doCut} />
    </div>
  )
}