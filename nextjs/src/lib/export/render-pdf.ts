import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { AssessmentExportData } from './types'

function wrap(text: string, maxChars: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split(/\r?\n/)) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    let line = ''
    for (const word of words) {
      if (line && line.length + word.length + 1 > maxChars) { lines.push(line); line = word }
      else line = line ? `${line} ${word}` : word
    }
    lines.push(line)
  }
  return lines.length ? lines : ['']
}

export async function renderPdf(data: AssessmentExportData): Promise<Uint8Array> {
  const document = await PDFDocument.create()
  const regular = await document.embedFont(StandardFonts.Helvetica)
  const bold = await document.embedFont(StandardFonts.HelveticaBold)
  const margin = 50
  const pageWidth = 595
  const pageHeight = 842
  const maxChars = 92
  let page = document.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  const write = (text: string, size: number, font = regular, gap = 5) => {
    for (const line of wrap(text, maxChars)) {
      if (y < margin + size + gap) { page = document.addPage([pageWidth, pageHeight]); y = pageHeight - margin }
      page.drawText(line, { x: margin, y, size, font, color: rgb(0.12, 0.12, 0.12) }); y -= size + gap
    }
  }

  write(data.name, 18, bold, 8)
  write(`Exported ${new Date(data.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}`, 9, regular, 18)
  let section = ''
  for (const answer of data.answers) {
    if (answer.sectionTitle !== section) { section = answer.sectionTitle; write(section, 13, bold, 8) }
    write(`${answer.questionNumber}. ${answer.questionText}`, 10, bold, 4)
    write(answer.answerText, 10, regular, 10)
  }
  return document.save()
}
