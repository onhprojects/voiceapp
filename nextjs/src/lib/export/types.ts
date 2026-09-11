export interface ExportAnswer {
  questionNumber: number
  questionText: string
  sectionTitle: string
  sectionIndex: number
  answerText: string
}

export interface AssessmentExportData {
  id: string
  name: string
  createdAt: string
  answers: ExportAnswer[]
}

export type ExportFormat = 'pdf' | 'docx' | 'md'
