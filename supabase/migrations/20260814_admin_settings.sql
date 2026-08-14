-- Create admin_settings table for admin-configurable options.
-- Each row represents a single admin option (e.g. site_title).
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    option_name text NOT NULL UNIQUE,
    option_value text NOT NULL DEFAULT '',
    option_field_type text NOT NULL DEFAULT 'text',
    option_title text NOT NULL,
    option_description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Admin settings are readable by anyone" ON public.admin_settings;
DROP POLICY IF EXISTS "Only admins can manage admin settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Service role can manage all admin settings" ON public.admin_settings;

-- Admin settings are readable by anyone (used to render site-wide values like site_title)
CREATE POLICY "Admin settings are readable by anyone"
ON public.admin_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Only users with role 'admin' in user_data can insert/update/delete admin settings.
-- Uses a subquery against user_data to enforce the admin role.
CREATE POLICY "Only admins can manage admin settings"
ON public.admin_settings
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_data
        WHERE user_data.user_id = auth.uid()
        AND user_data.user_role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_data
        WHERE user_data.user_id = auth.uid()
        AND user_data.user_role = 'admin'
    )
);

-- Service role can perform all operations
CREATE POLICY "Service role can manage all admin settings"
ON public.admin_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant permissions to roles for Data API access
GRANT SELECT ON public.admin_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_settings TO service_role;

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_settings_option_name ON public.admin_settings(option_name);
CREATE INDEX IF NOT EXISTS idx_admin_settings_created_at ON public.admin_settings(created_at DESC);

-- Seed some sensible default admin options
INSERT INTO public.admin_settings (option_name, option_value, option_field_type, option_title, option_description)
VALUES
    ('site_title', 'Resume Builder', 'text', 'Site Title', 'The name of your site shown in the browser tab and header.'),
    ('site_tagline', 'Create your resume the easy way', 'text', 'Site Tagline', 'A short tagline shown on the homepage.'),
    ('support_email', 'support@example.com', 'text', 'Support Email', 'The email address used for support inquiries.')
ON CONFLICT (option_name) DO NOTHING;