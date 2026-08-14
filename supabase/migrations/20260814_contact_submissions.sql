-- Create contact_submissions table for the contact form
-- Allows anonymous and authenticated users to submit contact messages.
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    email_address text NOT NULL,
    phone_number text,
    message text NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    -- Additional useful columns
    status text NOT NULL DEFAULT 'new',
    source text NOT NULL DEFAULT 'web',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add a check constraint to restrict status to a sensible set
ALTER TABLE public.contact_submissions
    DROP CONSTRAINT IF EXISTS contact_submissions_status_check;
ALTER TABLE public.contact_submissions
    ADD CONSTRAINT contact_submissions_status_check
    CHECK (status IN ('new', 'in_progress', 'resolved', 'closed'));

-- Add a check constraint to restrict source
ALTER TABLE public.contact_submissions
    DROP CONSTRAINT IF EXISTS contact_submissions_source_check;
ALTER TABLE public.contact_submissions
    ADD CONSTRAINT contact_submissions_source_check
    CHECK (source IN ('web', 'mobile', 'email', 'admin'));

-- Enable Row Level Security
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Contact submissions are insertable by anyone" ON public.contact_submissions;
DROP POLICY IF EXISTS "Users can view own contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Service role can manage all contact submissions" ON public.contact_submissions;

-- Allow any user (including anonymous) to insert a contact submission
CREATE POLICY "Contact submissions are insertable by anyone"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Logged-in users can view their own submissions
CREATE POLICY "Users can view own contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role can read/manage all submissions (for admin dashboard)
CREATE POLICY "Service role can manage all contact submissions"
ON public.contact_submissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT INSERT ON public.contact_submissions TO anon;
GRANT INSERT, SELECT ON public.contact_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_submissions TO service_role;

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id ON public.contact_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email_address ON public.contact_submissions(email_address);