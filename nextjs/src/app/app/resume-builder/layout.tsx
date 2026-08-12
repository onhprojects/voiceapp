// Resume Builder — route layout. Reuses the root AppLayout.
import AppLayout from '@/components/AppLayout'

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}