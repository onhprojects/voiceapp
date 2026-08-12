-- Create audio_text_assessments table
CREATE TABLE IF NOT EXISTS public.audio_text_assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    section_index integer NOT NULL,
    section_title text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create audio_text_responses table (for storing audio recordings and metadata)
CREATE TABLE IF NOT EXISTS public.audio_text_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id uuid NOT NULL REFERENCES public.audio_text_assessments(id) ON DELETE CASCADE,
    question_number integer NOT NULL,
    question_text text NOT NULL,
    section_title text NOT NULL,
    transcript_text text,
    audio_file_path text,
    duration_seconds integer,
    recorded_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audio_text_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_text_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own assessments" ON public.audio_text_assessments;
DROP POLICY IF EXISTS "Users can insert own assessments" ON public.audio_text_assessments;
DROP POLICY IF EXISTS "Users can update own assessments" ON public.audio_text_assessments;
DROP POLICY IF EXISTS "Users can view own responses" ON public.audio_text_responses;
DROP POLICY IF EXISTS "Users can insert own responses" ON public.audio_text_responses;
DROP POLICY IF EXISTS "Users can update own responses" ON public.audio_text_responses;
DROP POLICY IF EXISTS "Service role can manage all assessments" ON public.audio_text_assessments;
DROP POLICY IF EXISTS "Service role can manage all responses" ON public.audio_text_responses;

-- RLS Policies for audio_text_assessments
CREATE POLICY "Users can view own assessments"
ON public.audio_text_assessments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
ON public.audio_text_assessments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
ON public.audio_text_assessments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all assessments"
ON public.audio_text_assessments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- RLS Policies for audio_text_responses
CREATE POLICY "Users can view own responses"
ON public.audio_text_responses
FOR SELECT
TO authenticated
USING (
    assessment_id IN (
        SELECT id FROM public.audio_text_assessments
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert own responses"
ON public.audio_text_responses
FOR INSERT
TO authenticated
WITH CHECK (
    assessment_id IN (
        SELECT id FROM public.audio_text_assessments
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own responses"
ON public.audio_text_responses
FOR UPDATE
TO authenticated
USING (
    assessment_id IN (
        SELECT id FROM public.audio_text_assessments
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    assessment_id IN (
        SELECT id FROM public.audio_text_assessments
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Service role can manage all responses"
ON public.audio_text_responses
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_audio_text_assessments_user_id ON public.audio_text_assessments(user_id);
CREATE INDEX idx_audio_text_responses_assessment_id ON public.audio_text_responses(assessment_id);
