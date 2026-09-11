import type { AssessmentExportData } from './types'

function xml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function paragraph(text: string, bold = false, size?: number): string {
  const props = `${bold ? '<w:b/>' : ''}${size ? `<w:sz w:val="${size * 2}"/>` : ''}`
  return `<w:p><w:r>${props ? `<w:rPr>${props}</w:rPr>` : ''}<w:t xml:space="preserve">${xml(text)}</w:t></w:r></w:p>`
}

function documentXml(data: AssessmentExportData): string {
  const body: string[] = [paragraph(data.name, true, 22), paragraph(`Exported ${new Date(data.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}`)]
  let currentSection = ''
  for (const answer of data.answers) {
    if (answer.sectionTitle !== currentSection) {
      currentSection = answer.sectionTitle
      body.push(paragraph(currentSection, true, 16))
    }
    body.push(paragraph(`${answer.questionNumber}. ${answer.questionText}`, true))
    body.push(paragraph(answer.answerText))
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body.join('')}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of data) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
  }
  return (crc ^ 0xffffffff) >>> 0
}

function zip(files: Record<string, string>): Uint8Array {
  const encoder = new TextEncoder()
  const chunks: Uint8Array[] = []
  const entries: Array<{ name: string; offset: number; size: number; crc: number }> = []
  let offset = 0
  const push = (chunk: Uint8Array) => { chunks.push(chunk); offset += chunk.length }

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(name)
    const data = encoder.encode(content)
    const header = new Uint8Array(30 + nameBytes.length)
    const view = new DataView(header.buffer)
    view.setUint32(0, 0x04034b50, true); view.setUint16(4, 20, true); view.setUint16(6, 0x0800, true)
    view.setUint32(14, crc32(data), true); view.setUint32(18, data.length, true); view.setUint32(22, data.length, true)
    view.setUint16(26, nameBytes.length, true); header.set(nameBytes, 30)
    entries.push({ name, offset, size: data.length, crc: crc32(data) }); push(header); push(data)
  }

  const centralStart = offset
  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name)
    const central = new Uint8Array(46 + nameBytes.length)
    const view = new DataView(central.buffer)
    view.setUint32(0, 0x02014b50, true); view.setUint16(4, 20, true); view.setUint16(6, 20, true); view.setUint16(8, 0x0800, true)
    view.setUint32(16, entry.crc, true); view.setUint32(20, entry.size, true); view.setUint32(24, entry.size, true)
    view.setUint16(28, nameBytes.length, true); view.setUint32(42, entry.offset, true); central.set(nameBytes, 46); push(central)
  }

  const end = new Uint8Array(22)
  const view = new DataView(end.buffer)
  view.setUint32(0, 0x06054b50, true); view.setUint16(8, entries.length, true); view.setUint16(10, entries.length, true)
  view.setUint32(12, offset - centralStart, true); view.setUint32(16, centralStart, true); push(end)
  const result = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.length, 0))
  let position = 0
  for (const chunk of chunks) { result.set(chunk, position); position += chunk.length }
  return result
}

export function renderDocx(data: AssessmentExportData): Uint8Array {
  return zip({
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml': documentXml(data),
  })
}
