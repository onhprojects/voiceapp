'use client'

import React from 'react'
import { PublicIntakeForm } from '@/components/PublicIntakeForm'

export default function PublicIntakePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6">
        <PublicIntakeForm />
      </div>
    </div>
  )
}
