# Intake Assessment Export Status

Implemented:

- Markdown, Word (.docx), and PDF exports from stored text assessment answers.
- Ownership-checked export route at `/audio-text-assessment/api/text-assessments/[id]/export`.
- Shared export dropdown on `/audio-text-assessment` and `/my-assessments`.
- Typed-only assessments can export; the form no longer gates export on recorded audio.
- Safe attachment filenames and private, no-store responses.

Deferred:

- Google Docs export returns a clear `501` setup message until Google Drive credentials and an OAuth or service-account flow are configured. The existing Supabase Google sign-in does not provide Drive API access.
- Legacy `IntakeForm.tsx` export controls remain unchanged because they use a separate assessment data model.

Validation:

- `npx tsc --noEmit` passes.
- `npm run build` passes.
- Existing unrelated ESLint warnings remain in storage, table, resume-hom, auth/2fa, AudioRecorder, and MFASetup.
