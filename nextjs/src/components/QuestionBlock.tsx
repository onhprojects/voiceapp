'use client'

import React, { useState } from 'react'
import { AudioRecorder } from './AudioRecorder'
import { CheckCircle2 } from 'lucide-react'

interface QuestionBlockProps {
  questionNumber: number
  questionText: string
  sectionTitle?: string
  isRecorded: boolean
  onRecordingComplete: (questionNumber: number, questionText: string, sectionTitle: string, blob: Blob, duration: number, transcript: string) => void
  isUploading?: boolean
  transcript?: string
  onTranscriptChange?: (questionNumber: number, text: string) => void
  storageFolder?: string
}

export function QuestionBlock({
  questionNumber,
  questionText,
  sectionTitle = 'Assessment',
  isRecorded,
  onRecordingComplete,
  isUploading = false,
  transcript = '',
  onTranscriptChange,
  storageFolder = 'intake-audio',
}: QuestionBlockProps) {
  const [showRecorder, setShowRecorder] = useState(false)
  // storageFolder is reserved for future use with multi-bucket support
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _storageFolder = storageFolder

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
      {/* Question Header */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
            {questionNumber}
          </div>
        </div>
        <div className="flex-grow">
          <p className="text-base font-medium text-gray-900">{questionText}</p>
        </div>
        {isRecorded && (
          <div className="flex-shrink-0 flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Recorded</span>
          </div>
        )}
      </div>

      {/* Recording + Answer Area */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left column: recording controls */}
        <div className="md:w-1/5 flex flex-col gap-2">
          {!showRecorder && !isRecorded && (
            <button
              onClick={() => setShowRecorder(true)}
              className="py-2 px-4 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors border border-primary-200"
            >
              + Record Answer
            </button>
          )}

          {showRecorder && !isRecorded && (
            <AudioRecorder
              onRecordingComplete={(blob, duration, transcript) => {
                onTranscriptChange?.(questionNumber, transcript)
                onRecordingComplete(questionNumber, questionText, sectionTitle, blob, duration, transcript)
                setShowRecorder(false)
              }}
            />
          )}

          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-primary-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent" />
              Uploading...
            </div>
          )}
        </div>

        {/* Right column: textarea (shown by default when editable) */}
        {onTranscriptChange && (
          <div className="md:flex-1 min-w-[80%] space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              My Answer
            </label>
            <textarea
              value={transcript}
              onChange={(e) => onTranscriptChange(questionNumber, e.target.value)}
              placeholder="Your transcribed response will appear here (or type manually)..."
              className="w-full min-h-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}
      </div>
    </div>
  )
}
