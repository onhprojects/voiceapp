-- Fix user_data default role to 'free' and ensure new users are added on registration.
-- 1. Update the column default from 'user' to 'free'
ALTER TABLE public.user_data
    ALTER COLUMN user_role SET DEFAULT 'free';

-- 2. Update the handle_new_user function to insert new users with role 'free'
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

    -- Insert the new user into user_data with default role 'free'
    INSERT INTO public.user_data (user_id, first_name, last_name, user_role)
    VALUES (NEW.id, v_first_name, v_last_name, 'free');

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the auth trigger
    -- This prevents auth failures if user_data insert fails
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 3. Ensure the trigger exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 4. Add Rob Gelhausen as an admin user.
--    The user_id references the existing auth.users row for robmgel@gmail.com.
INSERT INTO public.user_data (user_id, user_role, first_name, last_name)
VALUES ('e9042ddb-2caa-4fdc-b172-7d028f101a7a', 'admin', 'Rob', 'Gelhausen')
ON CONFLICT (user_id) DO UPDATE
SET user_role = 'admin',
    first_name = 'Rob',
    last_name = 'Gelhausen',
    updated_at = now();