// Resume Builder — TipTap/ProseMirror editor schema.
// A focused set of extensions suitable for resume documents.

import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'

/**
 * The extension set used by the resume editor.
 * StarterKit includes: document, paragraph, text, bold, italic, strike,
 * heading, bulletList, orderedList, listItem, hardBreak, history, etc.
 */
export const resumeExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  }),
  Underline,
  TextStyle,
]