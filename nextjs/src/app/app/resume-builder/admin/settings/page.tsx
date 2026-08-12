// Resume Builder — admin settings: pick OpenRouter model.
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ModelSettingsForm } from '../../components/ModelSettingsForm'

export default function AdminSettingsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        href="/app/resume-builder"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to resumes
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        Configure the AI model used by the resume builder.
      </p>
      <ModelSettingsForm />
    </div>
  )
}