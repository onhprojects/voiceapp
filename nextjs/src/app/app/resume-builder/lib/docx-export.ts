// Resume Builder — server-side .docx export.
// Converts a ProseMirror/TipTap document (JSON) into a valid .docx (OOXML)
// using a minimal, self-contained serializer. No external engine required.

import type { PmNode } from './types'

/** Escape XML special characters. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Map a ProseMirror mark to OOXML run properties. */
function markProps(marks?: PmNode['marks']): string {
  let rPr = ''
  if (!marks) return rPr
  for (const m of marks) {
    if (m.type === 'bold') rPr += '<w:b/>'
    if (m.type === 'italic') rPr += '<w:i/>'
    if (m.type === 'underline') rPr += '<w:u w:val="single"/>'
    if (m.type === 'strike') rPr += '<w:strike/>'
  }
  return rPr
}

/** Serialize a single text node into a <w:r> run. */
function textRun(node: PmNode): string {
  const text = esc(node.text ?? '')
  const rPr = markProps(node.marks)
  return `<w:r>${rPr ? `<w:rPr>${rPr}</w:rPr>` : ''}<w:t xml:space="preserve">${text}</w:t></w:r>`
}

/** Serialize a paragraph node into a <w:p>. */
function paragraph(node: PmNode): string {
  const runs = (node.content ?? [])
    .map((child) => (child.type === 'text' ? textRun(child) : ''))
    .join('')

  // Heading levels map to outline levels.
  let pPr = ''
  if (node.type === 'heading') {
    const level = Number(node.attrs?.level ?? 1)
    pPr = `<w:pPr><w:outlineLvl w:val="${level - 1}"/></w:pPr>`
  }

  return `<w:p>${pPr}${runs}</w:p>`
}

/** Serialize a list item (bullet or ordered) into a <w:p> with numbering. */
function listItem(node: PmNode, ordered: boolean): string {
  const runs = (node.content ?? [])
    .map((child) => (child.type === 'text' ? textRun(child) : ''))
    .join('')
  const numId = ordered ? 2 : 1
  const ilvl = 0
  const pPr = `<w:pPr><w:numPr><w:ilvl w:val="${ilvl}"/><w:numId w:val="${numId}"/></w:numPr></w:pPr>`
  return `<w:p>${pPr}${runs}</w:p>`
}

/** Serialize a block node (paragraph, heading, list) into OOXML paragraphs. */
function block(node: PmNode, ordered: boolean): string {
  switch (node.type) {
    case 'paragraph':
    case 'heading':
      return paragraph(node)
    case 'bulletList':
      return (node.content ?? [])
        .map((li) => listItem(li, false))
        .join('')
    case 'orderedList':
      return (node.content ?? [])
        .map((li) => listItem(li, true))
        .join('')
    case 'listItem':
      return listItem(node, ordered)
    default:
      return paragraph(node)
  }
}

/** Build the document.xml body from a ProseMirror doc. */
function buildBody(doc: PmNode): string {
  const content = doc.content ?? []
  let ordered = false
  const paragraphs = content.map((node) => {
    if (node.type === 'orderedList') ordered = true
    if (node.type === 'bulletList') ordered = false
    return block(node, ordered)
  })
  return paragraphs.join('')
}

/** Minimal numbering.xml for bullet + ordered lists. */
function numberingXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/></w:lvl>
  </w:abstractNum>
  <w:abstractNum w:abstractNumId="1">
    <w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/></w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
  <w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num>
</w:numbering>`
}

function documentXml(doc: PmNode): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${buildBody(doc)}
    <w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
  </w:body>
</w:document>`
}

function contentTypesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`
}

function relsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
}

function documentRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>`
}

function stylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="200" w:after="100"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="160" w:after="80"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style>
</w:styles>`
}

/** Build a .docx as a Uint8Array from a ProseMirror doc. */
export function buildDocx(doc: PmNode): Uint8Array {
  const files: Record<string, string> = {
    '[Content_Types].xml': contentTypesXml(),
    '_rels/.rels': relsXml(),
    'word/document.xml': documentXml(doc),
    'word/numbering.xml': numberingXml(),
    'word/styles.xml': stylesXml(),
    'word/_rels/document.xml.rels': documentRelsXml(),
  }

  return buildZip(files)
}

/**
 * Minimal ZIP writer (store, no compression) producing a valid .docx.
 * A .docx is just a ZIP archive with the OOXML parts above.
 */
function buildZip(files: Record<string, string>): Uint8Array {
  const encoder = new TextEncoder()
  const chunks: Uint8Array[] = []
  const central: { name: string; offset: number; size: number }[] = []
  let offset = 0

  const push = (bytes: Uint8Array) => {
    chunks.push(bytes)
    offset += bytes.length
  }

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(name)
    const data = encoder.encode(content)
    const crc = crc32(data)

    // Local file header
    const local = new Uint8Array(30 + nameBytes.length)
    const dv = new DataView(local.buffer)
    dv.setUint32(0, 0x04034b50, true) // signature
    dv.setUint16(4, 20, true) // version needed
    dv.setUint16(6, 0x0800, true) // flags (UTF-8)
    dv.setUint16(8, 0, true) // method: store
    dv.setUint16(10, 0, true) // mod time
    dv.setUint16(12, 0x21, true) // mod date
    dv.setUint32(14, crc, true)
    dv.setUint32(18, data.length, true) // compressed size
    dv.setUint32(22, data.length, true) // uncompressed size
    dv.setUint16(26, nameBytes.length, true)
    dv.setUint16(28, 0, true) // extra length
    local.set(nameBytes, 30)

    push(local)
    central.push({ name, offset, size: data.length })
    push(data)
  }

  // Central directory
  const centralStart = offset
  for (const entry of central) {
    const nameBytes = encoder.encode(entry.name)
    const cd = new Uint8Array(46 + nameBytes.length)
    const dv = new DataView(cd.buffer)
    dv.setUint32(0, 0x02014b50, true) // signature
    dv.setUint16(4, 20, true) // version made by
    dv.setUint16(6, 20, true) // version needed
    dv.setUint16(8, 0x0800, true) // flags
    dv.setUint16(10, 0, true) // method
    dv.setUint16(12, 0, true) // mod time
    dv.setUint16(14, 0x21, true) // mod date
    dv.setUint32(16, crc32(encoder.encode('')), true) // crc (unused for dir)
    dv.setUint32(20, 0, true) // compressed size
    dv.setUint32(24, 0, true) // uncompressed size
    dv.setUint16(28, nameBytes.length, true)
    dv.setUint16(30, 0, true) // extra
    dv.setUint16(32, 0, true) // comment
    dv.setUint16(34, 0, true) // disk
    dv.setUint16(36, 0, true) // internal attrs
    dv.setUint32(38, 0, true) // external attrs
    dv.setUint32(42, entry.offset, true) // local header offset
    cd.set(nameBytes, 46)
    push(cd)
  }

  const centralSize = offset - centralStart

  // End of central directory
  const eocd = new Uint8Array(22)
  const edv = new DataView(eocd.buffer)
  edv.setUint32(0, 0x06054b50, true) // signature
  edv.setUint16(4, 0, true) // disk
  edv.setUint16(6, 0, true) // cd start disk
  edv.setUint16(8, central.length, true) // entries on disk
  edv.setUint16(10, central.length, true) // total entries
  edv.setUint32(12, centralSize, true) // cd size
  edv.setUint32(16, centralStart, true) // cd offset
  edv.setUint16(20, 0, true) // comment length
  push(eocd)

  const total = chunks.reduce((sum, c) => sum + c.length, 0)
  const out = new Uint8Array(total)
  let pos = 0
  for (const c of chunks) {
    out.set(c, pos)
    pos += c.length
  }
  return out
}

/** CRC-32 (IEEE) used by the ZIP format. */
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let k = 0; k < 8; k++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}
