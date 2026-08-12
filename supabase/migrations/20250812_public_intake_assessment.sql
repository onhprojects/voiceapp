-- Create public_intake_assessments table for anonymous/public submissions
CREATE TABLE IF NOT EXISTS public.public_intake_assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL UNIQUE,
    email text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create public_intake_responses table
CREATE TABLE IF NOT EXISTS public.public_intake_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id uuid NOT NULL REFERENCES public.public_intake_assessments(id) ON DELETE CASCADE,
    question_number integer NOT NULL,
    question_text text NOT NULL,
    section_title text NOT NULL,
    audio_file_path text,
    duration_seconds integer,
    recorded_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.public_intake_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_intake_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public assessments are readable by anyone" ON public.public_intake_assessments;
DROP POLICY IF EXISTS "Public assessments are insertable" ON public.public_intake_assessments;
DROP POLICY IF EXISTS "Service role can manage all public assessments" ON public.public_intake_assessments;
DROP POLICY IF EXISTS "Public responses are readable by anyone" ON public.public_intake_responses;
DROP POLICY IF EXISTS "Public responses are insertable" ON public.public_intake_responses;
DROP POLICY IF EXISTS "Service role can manage all public responses" ON public.public_intake_responses;

-- RLS Policies for public_intake_assessments (allow unauthenticated insert)
CREATE POLICY "Public assessments are insertable"
ON public.public_intake_assessments
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Public assessments are readable by anyone"
ON public.public_intake_assessments
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Service role can manage all public assessments"
ON public.public_intake_assessments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- RLS Policies for public_intake_responses
CREATE POLICY "Public responses are insertable"
ON public.public_intake_responses
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Public responses are readable by anyone"
ON public.public_intake_responses
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Service role can manage all public responses"
ON public.public_intake_responses
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant permissions to roles
GRANT INSERT, SELECT ON public.public_intake_assessments TO anon;
GRANT INSERT, SELECT ON public.public_intake_responses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_intake_assessments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_intake_responses TO service_role;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_public_intake_assessments_session_id ON public.public_intake_assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_public_intake_assessments_created_at ON public.public_intake_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_intake_responses_assessment_id ON public.public_intake_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_public_intake_responses_created_at ON public.public_intake_responses(created_at DESC);
