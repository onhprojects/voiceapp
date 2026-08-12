-- Create user_data table
CREATE TABLE IF NOT EXISTS public.user_data (
    user_id uuid NOT NULL PRIMARY KEY,
    user_role text NOT NULL DEFAULT 'user',
    first_name text,
    last_name text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add foreign key constraint to auth.users with ON DELETE CASCADE
ALTER TABLE public.user_data
ADD CONSTRAINT user_data_user_id_fkey FOREIGN KEY (user_id)
REFERENCES auth.users(id) ON DELETE CASCADE
NOT VALID;

-- Validate the constraint (safe on existing data if table is empty)
ALTER TABLE public.user_data
VALIDATE CONSTRAINT user_data_user_id_fkey;

-- Enable Row Level Security
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own data" ON public.user_data;
DROP POLICY IF EXISTS "Users can update own data" ON public.user_data;
DROP POLICY IF EXISTS "Service role can manage all" ON public.user_data;

-- RLS Policy: Authenticated users can SELECT their own row
CREATE POLICY "Users can view own data"
ON public.user_data
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policy: Authenticated users can UPDATE their own row (requires both USING and WITH CHECK)
CREATE POLICY "Users can update own data"
ON public.user_data
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Service role can perform all operations
CREATE POLICY "Service role can manage all"
ON public.user_data
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant permissions to roles for Data API access
GRANT SELECT ON public.user_data TO authenticated;
GRANT UPDATE ON public.user_data TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_data TO service_role;

-- Create function to insert user_data on auth.users INSERT
-- This function runs with SECURITY INVOKER (caller's privileges, not creator's)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_first_name text;
    v_last_name text;
BEGIN
    -- Extract first_name and last_name from raw_user_meta_data if available
    -- raw_user_meta_data is JSON, so we use ->> to get text values
    v_first_name := NEW.raw_user_meta_data->>'first_name';
    v_last_name := NEW.raw_user_meta_data->>'last_name';

    -- Insert the new user into user_data with default role 'user'
    INSERT INTO public.user_data (user_id, first_name, last_name, user_role)
    VALUES (NEW.id, v_first_name, v_last_name, 'user');

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the auth trigger
    -- This prevents auth failures if user_data insert fails
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Create trigger on auth.users table
-- Drop existing trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger that fires AFTER INSERT on auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create index on created_at for query performance (common filter)
CREATE INDEX IF NOT EXISTS idx_user_data_created_at ON public.user_data(created_at DESC);

-- Create index on user_role for filtering by role
CREATE INDEX IF NOT EXISTS idx_user_data_user_role ON public.user_data(user_role);
