import type { ExportFormat } from './types'

const extensions: Record<ExportFormat, string> = {
  pdf: 'pdf',
  docx: 'docx',
  md: 'md',
}

export function exportFilename(name: string, format: ExportFormat): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .slice(0, 80)

  return `${slug || 'assessment'}.${extensions[format]}`
}
