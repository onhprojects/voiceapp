import type { AssessmentExportData } from './types'

function escapeHeading(value: string): string {
  return value.replace(/\r?\n/g, ' ').trim()
}

export function renderMarkdown(data: AssessmentExportData): string {
  const sections = new Map<string, AssessmentExportData['answers']>()
  for (const answer of data.answers) {
    const existing = sections.get(answer.sectionTitle) ?? []
    existing.push(answer)
    sections.set(answer.sectionTitle, existing)
  }

  const lines = [
    `# ${escapeHeading(data.name)}`,
    '',
    `_Exported ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}_`,
    '',
  ]

  for (const [sectionTitle, answers] of sections) {
    lines.push(`## ${escapeHeading(sectionTitle)}`, '')
    for (const answer of answers) {
      lines.push(`**${answer.questionNumber}. ${escapeHeading(answer.questionText)}**`, '', answer.answerText.trim(), '')
    }
  }

  return `${lines.join('\n').trimEnd()}\n`
}
