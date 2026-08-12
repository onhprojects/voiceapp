'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Pause, Trash2, Download } from 'lucide-react'

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void
  onRecordingStart?: () => void
}

interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  audioBlob: Blob | null
  duration: number
  currentTime: number
}

export function AudioRecorder({ 
  onRecordingComplete, 
  onRecordingStart
}: AudioRecorderProps) {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    audioBlob: null,
    duration: 0,
    currentTime: 0,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up audio context for visualization (optional)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as Record<string, unknown>).webkitAudioContext as typeof AudioContext)()
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setState((prev) => ({
          ...prev,
          audioBlob,
          isRecording: false,
        }))

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()

      setState((prev) => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
        currentTime: 0,
      }))

      onRecordingStart?.()

      // Start timer
      let seconds = 0
      timerIntervalRef.current = setInterval(() => {
        seconds++
        setState((prev) => ({
          ...prev,
          duration: seconds,
        }))
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Unable to access microphone. Please check your permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && state.isRecording) {
      if (state.isPaused) {
        mediaRecorderRef.current.resume()
        setState((prev) => ({ ...prev, isPaused: false }))
      } else {
        mediaRecorderRef.current.pause()
        setState((prev) => ({ ...prev, isPaused: true }))
      }
    }
  }

  const deleteRecording = () => {
    setState({
      isRecording: false,
      isPaused: false,
      audioBlob: null,
      duration: 0,
      currentTime: 0,
    })
    if (audioElementRef.current) {
      audioElementRef.current.src = ''
    }
    chunksRef.current = []
  }

  const saveRecording = () => {
    if (state.audioBlob) {
      onRecordingComplete(state.audioBlob, state.duration)
    }
  }

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-3">
      {/* Recording Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {!state.isRecording && !state.audioBlob && (
          <button
            onClick={startRecording}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            <Mic className="h-4 w-4" />
            Record
          </button>
        )}

        {state.isRecording && (
          <>
            <button
              onClick={pauseRecording}
              className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
            >
              {state.isPaused ? (
                <>
                  <Play className="h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              )}
            </button>

            <button
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
            >
              <Square className="h-4 w-4" />
              Stop
            </button>

            <span className="ml-auto text-sm font-medium text-gray-700">
              {formatTime(state.duration)}
            </span>
          </>
        )}
      </div>

      {/* Playback Controls */}
      {state.audioBlob && !state.isRecording && (
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Recording preview:</p>
            <audio
              ref={audioElementRef}
              controls
              className="w-full"
              src={URL.createObjectURL(state.audioBlob)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={saveRecording}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="h-4 w-4" />
              Save Recording
            </button>

            <button
              onClick={deleteRecording}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Timer Display During Recording */}
      {state.isRecording && (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-lg animate-pulse">
          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-red-700">{formatTime(state.duration)}</span>
        </div>
      )}
    </div>
  )
}
