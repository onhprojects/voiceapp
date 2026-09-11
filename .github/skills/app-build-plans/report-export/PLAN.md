# Intake Assessment Export — Build Plan

**Goal:** Let a signed-in user export one of their intake assessments (the text
questionnaire stored in `text_assessments` + `text_assessment_answers`) to four
formats:

1. **PDF**
2. **Word** (`.docx`)
3. **Markdown** (`.md`)
4. **Google Doc**

Two entry points:

- **`/audio-text-assessment`** — the existing `Export Results` button is currently
  a no-op (`exportAssessment()` only `console.log`s a manifest and shows an
  `alert`). Make it open a **format dropdown** and perform a real download.
- **`/my-assessments`** — add an **Export** dropdown button to each assessment row
  alongside the existing Rename / Delete actions.

---

## 1. Current state (verified in the repo)

| Piece | Location | Status |
|---|---|---|
| Export button (form page) | `nextjs/src/components/AudioTextAssessmentForm.tsx` (~line 551) | Renders, but `onClick={exportAssessment}` only logs + alerts. Disabled when `recordedCount === 0`. |
| Export button (legacy intake) | `nextjs/src/components/IntakeForm.tsx` (~lines 326, 408) | Same no-op pattern. Out of scope unless we choose to update it too. |
| Assessment list | `nextjs/src/components/MyAssessments.tsx` | Row actions: Rename + Delete only. Receives `TextAssessment[]` from `my-assessments/page.tsx`. |
| Data source | `text_assessments` (id, user_id, name, created_at, updated_at) and `text_assessment_answers` (assessment_id, question_number, question_text, section_title, section_index, answer_text) | RLS-protected, owner-scoped. |
| Answers API (reference) | `nextjs/src/app/(dashboard)/audio-text-assessment/api/text-assessments/[id]/answers/route.ts` | `GET` returns `{ answers }` after ownership check — reuse this contract. |
| Word-export reference | `nextjs/src/app/(dashboard)/resume-builder/lib/docx-export.ts` | Self-contained OOXML + store-only ZIP writer, **no external dep**. Great starting point for the `.docx` exporter. |
| `.docx` route reference | `nextjs/src/app/(dashboard)/resume-builder/api/export/route.ts` | Auth check → build bytes → `Content-Disposition: attachment`. Copy this shape. |
| UI primitives | `nextjs/src/components/ui/` | Has `button`, `card`, `dialog`, `alert-dialog`, `input`, `textarea`, `ProgressBar`. **No dropdown-menu primitive.** |

**Key constraint:** The questionnaire's canonical structure lives client-side in
`QUESTIONNAIRE_DATA` (in `AudioTextAssessmentForm.tsx`). The DB stores only
*answered* rows (with `section_title`, `section_index`, `question_number`,
`question_text`), so exports should be built from the **DB rows**, not from
`QUESTIONNAIRE_DATA`, so the server can export any assessment by id (needed for
`/my-assessments`). Unanswered questions are simply omitted.

---

## 2. Architecture

```mermaid
flowchart TD
  subgraph Client
    AF[AudioTextAssessmentForm<br/>Export Results ▾]
    MA[MyAssessments row<br/>Export ▾]
    EM[ExportMenu component<br/>shared dropdown]
  end

  AF --> EM
  MA --> EM

  EM -->|GET ?format=...| API[/api/assessments/:id/export]

  API --> AUTH[Auth + ownership check<br/>createSSRClient + RLS]
  AUTH --> BUILD[buildAssessmentData id]
  BUILD --> R1[renderMarkdown]
  BUILD --> R2[renderDocx]
  BUILD --> R3[renderPdf]
  BUILD --> R4[renderHtml client]

  R1 --> DL[File download]
  R2 --> DL
  R3 --> DL

  R4 --> GDOC[Google Docs flow]
  GDOC -->|POST| GD[/api/assessments/:id/export/google]
  GD -->|Drive API files.create<br/>application/vnd.google-apps.document| DRIVE[Google Drive]
  DRIVE -->|webViewLink| DL
```

**Deletability:** Everything new is colocated under:
- `nextjs/src/lib/export/` — format-neutral data + serializers
- `nextjs/src/components/ExportMenu.tsx` — shared dropdown UI
- `nextjs/src/app/(dashboard)/audio-text-assessment/api/assessments/[id]/export/` — API routes

Removing those three locations plus the two `ExportMenu` call sites reverts the
feature. No schema changes required for the first three formats; Google Docs may
add a small `google_drive_tokens` store (see §5).

---

## 3. Proposed file layout

```
nextjs/src/
├── components/
│   ├── ExportMenu.tsx                 # 'use client' dropdown (shared)
│   └── ui/dropdown-menu.tsx           # NEW thin wrapper (Radix) OR custom
├── lib/export/
│   ├── types.ts                       # AssessmentExportData, ExportFormat
│   ├── build-assessment-data.ts       # server: fetch + normalize rows
│   ├── render-markdown.ts             # data -> string
│   ├── render-docx.ts                 # data -> Uint8Array (OOXML + ZIP)
│   ├── render-pdf.ts                  # data -> Uint8Array
│   └── filename.ts                    # slugify + extension map
└── app/(dashboard)/audio-text-assessment/api/
    └── assessments/
        ├── [id]/export/route.ts       # GET ?format=pdf|docx|md
        └── [id]/export/google/route.ts# POST -> Google Doc, returns view link
```

> **Route location caveat:** existing assessment API routes live under
> `audio-text-assessment/api/text-assessments/...`. To stay consistent, prefer
> `audio-text-assessment/api/assessments/[id]/export` **or** mirror the existing
> `text-assessments/[id]/...` naming. Pick one and keep it consistent; the plan
> below assumes `.../api/text-assessments/[id]/export`.

---

## 4. Format-by-format design

### 4.1 Shared: `AssessmentExportData`

```ts
export interface ExportAnswer {
  questionNumber: number
  questionText: string
  sectionTitle: string
  sectionIndex: number
  answerText: string
}

export interface AssessmentExportData {
  id: string
  name: string
  createdAt: string
  answers: ExportAnswer[] // sorted by section_index, then question_number
}
```

`build-assessment-data.ts` runs server-side:
1. `supabase.auth.getUser()` → 401 if absent.
2. Select `text_assessments` by id; verify `user_id === user.id` (belt-and-braces
   on top of RLS) → 404 if not found/not owned.
3. Select `text_assessment_answers` where `assessment_id = id`, ordered by
   `section_index`, then `question_number`.
4. Group answers by `sectionTitle` for rendering.

### 4.2 Markdown (simplest — do first)

- `render-markdown.ts` emits:
  ```
  # {name}

  _Exported {date}_

  ## {sectionTitle}

  **{questionNumber}. {questionText}**

  {answerText}
  ```
- Download as `text/markdown; charset=utf-8` via the shared route.
- **Zero new dependencies.**

### 4.3 Word `.docx`

- Port/adapt `resume-builder/lib/docx-export.ts`'s OOXML serializer + minimal ZIP
  writer into `lib/export/render-docx.ts` (extract the generic ZIP/XML helpers to
  avoid duplication, or copy and keep the export folder self-contained — prefer
  extraction into `lib/export/ooxml/` if time allows).
- Emit: title heading, a subtitle line, one heading per section, and
  question/answer paragraphs (bold question run, normal answer run).
- Content type:
  `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.

### 4.4 PDF

Two viable options — **choose one, document the choice in STATUS.md**:

| Option | Approach | Pros | Cons |
|---|---|---|---|
| **A. Server-side (recommended)** | Add `pdf-lib` (pure JS, no native deps) and lay out text with manual wrapping/pagination. | Real `.pdf` file, works from `/my-assessments` without opening the form, no browser chrome. | Manual line-wrapping/pagination code. |
| **B. Client-side print** | Open a hidden route/preview with print CSS and call `window.print()` → "Save as PDF". | No dependency. | Not a true export button/download; browser-dependent; poor for the list page. |

Recommendation: **Option A** (`pdf-lib`, a lightweight, well-maintained, pure-JS
library). Implement `render-pdf.ts` with:
- A4 page, 50pt margins, Helvetica 11pt body / 16pt headings.
- Simple word-wrap helper + page-break when `y < margin`.
- Title + date header, then sectioned Q/A blocks.

### 4.5 Google Doc

This is the only format that needs a third-party account + OAuth. Two approaches:

**Approach 1 — Drive import (recommended).**
1. Reuse the **Word `.docx` bytes** (already built) as the import source.
2. `POST https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`
   with `metadata = { name, mimeType: 'application/vnd.google-apps.document' }`
   and the `.docx` as the media part. Drive converts it to a native Google Doc.
3. Return the `webViewLink` (`https://docs.google.com/document/d/{id}/edit`) and
   open it in a new tab; show a toast/link in the UI.

**Approach 2 — Docs API.**
Create an empty doc then `documents.batchUpdate` to insert text. More API calls,
more code, no extra capability. **Not recommended** — use Approach 1.

**OAuth requirements (the hard part):**
- Scope: `https://www.googleapis.com/auth/drive.file` (least privilege — only
  files the app creates).
- Requires a Google Cloud OAuth client with the Drive API enabled and a
  **verified redirect URI**. The existing Google login via Supabase Auth does
  **not** grant Drive scope — this is a separate consent.
- Options:
  - **(a) Separate OAuth flow** — add `/api/auth/google-drive/connect` +
    `callback`, store refresh/access tokens. See §5 for storage.
  - **(b) Service account + shared folder** — app-owned Drive, no per-user
    consent, but the doc lives in the app's Drive unless shared. Simpler, less
    "personal". Good MVP fallback.

Recommendation: implement **Approach 1** with **option (b) service account** for
MVP so the button works without blocking on a Google verification review, then
upgrade to per-user OAuth (a) as a follow-up. If a Google Cloud OAuth client is
not available in this workspace, ship the button with a clear
"Connect Google Drive" empty state and keep the server route behind a feature
flag/env var.

---

## 5. Schema / secrets

**No DB changes** for Markdown, Word, PDF.

For Google Docs, either:

- **Service-account (MVP):** no DB table. Store credentials in env:
  `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_DRIVE_FOLDER_ID`.
  Docs are created in a shared app folder.
- **Per-user OAuth:** add a minimal, RLS-protected table:
  ```sql
  create table public.google_drive_tokens (
    user_id uuid primary key references auth.users(id) on delete cascade,
    refresh_token text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
  alter table public.google_drive_tokens enable row level security;
  create policy "owner read"   on public.google_drive_tokens for select using (auth.uid() = user_id);
  create policy "owner write"  on public.google_drive_tokens for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);
  ```
  Add to `supabase/schema.sql` and a migration under `supabase/migrations/`.

Never expose tokens/service keys to the client. All Google calls happen in the
route handler.

---

## 6. UI: the dropdown

**Add a menu primitive.** There is no dropdown-menu component today. Preferred:
add `@radix-ui/react-dropdown-menu` (consistent with the existing Radix
`dialog`/`alert-dialog` deps) and create a thin
`nextjs/src/components/ui/dropdown-menu.tsx` styled like the other primitives.
Alternative (no new dep): a small custom `ExportMenu` using a button + absolutely
positioned panel + click-outside/Escape handling. Recommend Radix for a11y
(roving focus, keyboard nav) unless we want zero new deps.

**`ExportMenu` component API:**

```tsx
'use client'
interface ExportMenuProps {
  assessmentId: string | null
  assessmentName?: string
  disabled?: boolean
  size?: 'sm' | 'default'
  variant?: 'default' | 'outline' | 'destructive'
  className?: string
}
```

Behavior:
- Renders a `Button` with a `Download` icon + `ChevronDown` + "Export".
- Menu items: **PDF**, **Word (.docx)**, **Markdown (.md)**, **Google Doc**.
- On select (non-Google): set local `isExporting` + format, then trigger a
  download. Simplest reliable pattern is a real navigation that streams the file:
  ```ts
  const url = `/audio-text-assessment/api/text-assessments/${assessmentId}/export?format=${fmt}`
  // Option A: window.location.assign(url) — browser handles Content-Disposition
  // Option B: fetch -> blob -> object URL -> <a download> (needed if we want a
  //           per-item spinner that resolves deterministically)
  ```
  Prefer **Option B** so the button can show a spinner and surface JSON errors
  (e.g. 401/404) instead of navigating to a raw JSON error page.
- On **Google Doc**: `POST` the google route, then `window.open(viewLink, '_blank')`
  (or show an inline link/toast if popups are blocked).
- Disabled state: pass through `disabled` (form page disables when 0 answers
  recorded; list page disables if `!assessmentId`).
- Accessibility: `aria-haspopup="menu"`, `aria-expanded`, keyboard nav, focus ring.

**Wire-up A — `AudioTextAssessmentForm.tsx`:**
- Replace the current `<Button onClick={exportAssessment} ...>` with
  `<ExportMenu assessmentId={textAssessmentId} assessmentName={...}
  disabled={isExporting || answeredCount === 0} className="bg-green-600 ..." />`.
  (Note: the current button keys off `recordedCount` (audio) but the exportable
  content is `answeredCount` (audio *and* typed text). Switch the disabled
  condition to `answeredCount === 0` so typed-only assessments can export too.)
- Delete/replace `exportAssessment()` and the now-unused `isExporting` state if
  it isn't needed elsewhere.

**Wire-up B — `MyAssessments.tsx`:**
- In the row action `<div className="flex shrink-0 items-center gap-2">`, add
  `<ExportMenu assessmentId={assessment.id} assessmentName={assessment.name}
  size="sm" variant="outline" />` before Rename.
- No new data fetching — the handler hits the API by id.
- Keep actions from wrapping awkwardly on mobile; the row is already
  `flex-col sm:flex-row`.

---

## 7. Security

- Every export route re-checks `auth.getUser()` **and** row ownership; never rely
  on the client-supplied id alone. RLS is defense-in-depth, not the only gate.
- Google route: validate that the requesting user owns the assessment before
  uploading, and never return refresh tokens to the client.
- Sanitize filenames (`slugify` name, strip control chars) to prevent header
  injection in `Content-Disposition`.
- Rate-limit / size-bound is low risk (single assessment), but consider a simple
  per-user limit if abuse appears.
- Service-account key must stay in server env; add to `.env.example` (if present)
  and Vercel env, never `NEXT_PUBLIC_*`.

---

## 8. Phased implementation

**Phase 0 — Shared plumbing**
1. `lib/export/types.ts` + `filename.ts`.
2. `lib/export/build-assessment-data.ts` (auth + ownership + fetch/normalize).
3. Add `ExportMenu` + dropdown primitive.

**Phase 1 — Markdown**
4. `render-markdown.ts`.
5. `GET /api/text-assessments/[id]/export?format=md` route returning the file.
6. Wire `ExportMenu` into `AudioTextAssessmentForm` (form page only).

**Phase 2 — Word**
7. Extract/port ZIP+OOXML helpers; implement `render-docx.ts`.
8. Add `format=docx` to the route.
9. Validate output unzips and opens in Word/Google Docs.

**Phase 3 — PDF**
10. `npm i pdf-lib`; implement `render-pdf.ts` (wrap + paginate).
11. Add `format=pdf` to the route.

**Phase 4 — List page**
12. Add `ExportMenu` to each row in `MyAssessments.tsx` (covers all four formats
    already wired for md/docx/pdf; Google gated on Phase 5).

**Phase 5 — Google Docs**
13. Decide service-account (MVP) vs per-user OAuth; configure credentials.
14. `POST /api/text-assessments/[id]/export/google` → Drive import of the `.docx`
    → return `webViewLink`.
15. Wire the Google item in `ExportMenu`; add connect/empty state if OAuth.

**Phase 6 — Polish**
16. Per-format loading state + error toasts (no more `alert()`).
17. Empty/disabled states, mobile layout check, a11y pass.
18. Update this folder's `STATUS.md` with what shipped + deviations.

---

## 9. Acceptance criteria

- [ ] On `/audio-text-assessment`, the Export button is **clickable** and opens a
      dropdown with PDF, Word, Markdown, Google Doc.
- [ ] Clicking a format downloads a valid file with the assessment's name and
      answers (sections preserved, Q/A readable).
- [ ] On `/my-assessments`, **every** assessment row has an Export dropdown that
      downloads that specific assessment without opening the form.
- [ ] Word file opens cleanly in Word / Google Docs.
- [ ] PDF renders wrapped, paginated text (no clipped lines).
- [ ] Markdown preserves headings, sections, and Q/A structure.
- [ ] Google Doc (if credentials available) opens a new tab with the converted
      doc; otherwise shows a clear "connect Google Drive" state.
- [ ] Unauthorized / non-owner requests return 401/404 and never leak data.
- [ ] No `alert()` calls remain in the export path.

---

## 10. Open questions / decisions needed

1. **PDF**: accept a new `pdf-lib` dependency, or use client-side `window.print()`
   with print CSS?
2. **Google Docs auth**: service-account shared drive (MVP, works now) vs per-user
   OAuth (better UX, needs Google Cloud consent/config)?
3. **Scope**: also update the legacy `IntakeForm.tsx` export buttons, or leave
   them (they use a different audio-assessment data model)?
4. **Menu primitive**: add `@radix-ui/react-dropdown-menu`, or hand-roll to avoid
   a dependency?
5. **Route naming**: `.../api/text-assessments/[id]/export` vs
   `.../api/assessments/[id]/export` — pick one convention.
