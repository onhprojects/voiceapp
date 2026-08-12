'use client'

import React, { useState } from 'react'
import { AudioRecorder } from './AudioRecorder'
import { CheckCircle2 } from 'lucide-react'

interface QuestionBlockProps {
  questionNumber: number
  questionText: string
  isRecorded: boolean
  onRecordingComplete: (blob: Blob, duration: number) => void
  isUploading?: boolean
}

export function QuestionBlock({
  questionNumber,
  questionText,
  isRecorded,
  onRecordingComplete,
  isUploading = false,
}: QuestionBlockProps) {
  const [showRecorder, setShowRecorder] = useState(false)

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

      {/* Recording Area */}
      {!showRecorder && !isRecorded && (
        <button
          onClick={() => setShowRecorder(true)}
          className="w-full py-2 px-4 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors border border-primary-200"
        >
          + Record Answer
        </button>
      )}

      {showRecorder && !isRecorded && (
        <div className="pt-2">
          <AudioRecorder
            questionNumber={questionNumber}
            onRecordingComplete={(blob, duration) => {
              onRecordingComplete(blob, duration)
              setShowRecorder(false)
            }}
          />
        </div>
      )}

      {/* Uploading Indicator */}
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-primary-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent" />
          Uploading...
        </div>
      )}
    </div>
  )
}
