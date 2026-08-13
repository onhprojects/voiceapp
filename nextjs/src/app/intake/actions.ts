'use server'

import { createSPAClient } from '@/lib/supabase/client'
import { Tables } from '@/lib/types'

type PublicIntakeAssessment = Tables<'public_intake_assessments'>
type PublicIntakeResponse = Tables<'public_intake_responses'>

interface CreatePublicAssessmentInput {
  sessionId: string
  email?: string
}

interface SavePublicResponseInput {
  assessmentId: string
  questionNumber: number
  questionText: string
  sectionTitle: string
  audioFilePath: string
  durationSeconds?: number
}

/**
 * Creates a new public intake assessment session with a session ID
 */
export async function createPublicAssessment(
  input: CreatePublicAssessmentInput
): Promise<PublicIntakeAssessment> {
  const supabase = createSPAClient()

  // Create the assessment
  const { data, error } = await (supabase
    .from('public_intake_assessments')
    .insert({
      session_id: input.sessionId,
      email: input.email,
    }))
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create assessment: ${error.message}`)
  }

  return data as PublicIntakeAssessment
}

/**
 * Uploads an audio file to Supabase Storage (public bucket)
 */
export async function uploadPublicAudioFile(
  sessionId: string,
  questionNumber: number,
  audioBlob: Blob
): Promise<string> {
  const supabase = createSPAClient()

  // Create a unique file path
  const fileName = `public-assessments/${sessionId}/q${questionNumber}-${Date.now()}.webm`

  // Upload the file
  const { data, error } = await supabase.storage
    .from('intake-audio')
    .upload(fileName, audioBlob, {
      contentType: audioBlob.type || 'audio/webm',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload audio: ${error.message}`)
  }

  return data.path
}

/**
 * Saves a public intake response
 */
export async function savePublicIntakeResponse(
  assessmentId: string,
  input: SavePublicResponseInput
): Promise<PublicIntakeResponse> {
  const supabase = createSPAClient()

  // Create the response record
  const { data: response, error: responseError } = await (supabase
    .from('public_intake_responses')
    .insert({
      assessment_id: assessmentId,
      question_number: input.questionNumber,
      question_text: input.questionText,
      section_title: input.sectionTitle,
      audio_file_path: input.audioFilePath,
      duration_seconds: input.durationSeconds,
      recorded_at: new Date().toISOString(),
    }))
    .select()
    .single()

  if (responseError) {
    throw new Error(`Failed to save response: ${responseError.message}`)
  }

  return response as PublicIntakeResponse
}

/**
 * Gets a public download URL for an audio file
 */
export async function getPublicAudioDownloadUrl(audioFilePath: string): Promise<string> {
  const supabase = createSPAClient()

  const { data } = supabase.storage.from('intake-audio').getPublicUrl(audioFilePath)

  return data.publicUrl
}
