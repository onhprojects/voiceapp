import { createSSRClient } from '@/lib/supabase/server'
import type { AssessmentExportData } from './types'

export async function buildAssessmentData(id: string): Promise<AssessmentExportData | null> {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: assessment, error: assessmentError } = await supabase
    .from('text_assessments')
    .select('id, user_id, name, created_at')
    .eq('id', id)
    .single()

  if (assessmentError || !assessment || assessment.user_id !== user.id) return null

  const { data: rows, error: answersError } = await supabase
    .from('text_assessment_answers')
    .select('question_number, question_text, section_title, section_index, answer_text')
    .eq('assessment_id', id)
    .order('section_index', { ascending: true })
    .order('question_number', { ascending: true })

  if (answersError) throw new Error(answersError.message)

  return {
    id: assessment.id,
    name: assessment.name,
    createdAt: assessment.created_at,
    answers: (rows ?? []).map((row) => ({
      questionNumber: row.question_number,
      questionText: row.question_text,
      sectionTitle: row.section_title,
      sectionIndex: row.section_index,
      answerText: row.answer_text,
    })),
  }
}
