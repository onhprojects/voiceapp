-- Update the handle_new_user function to also store the user's email.
-- The email is available from the NEW record in the auth.users trigger context.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_first_name text;
    v_last_name text;
BEGIN
    -- Extract first_name and last_name from raw_user_meta_data if available
    v_first_name := NEW.raw_user_meta_data->>'first_name';
    v_last_name := NEW.raw_user_meta_data->>'last_name';

    -- Insert the new user into user_data with default role 'free'
    INSERT INTO public.user_data (user_id, first_name, last_name, email, user_role)
    VALUES (NEW.id, v_first_name, v_last_name, NEW.email, 'free');

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;