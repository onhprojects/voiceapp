import { AudioTextAssessmentForm } from '@/components/AudioTextAssessmentForm'

export const dynamic = 'force-dynamic'

export default async function AudioTextAssessmentDetailPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>
}) {
  const { assessmentId } = await params

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <AudioTextAssessmentForm initialAssessmentId={assessmentId} />
    </div>
  )
}