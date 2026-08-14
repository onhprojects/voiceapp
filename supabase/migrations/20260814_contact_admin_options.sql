-- Add admin options for the /contact page.
-- These options control the contact information shown on the contact page.
INSERT INTO public.admin_settings (option_name, option_value, option_field_type, option_title, option_description)
VALUES
    ('phone_number', '+1 (555) 123-4567', 'text', 'Phone Number', 'The phone number shown on the contact page.'),
    ('support_hours', 'Monday - Friday, 9am - 5pm', 'text', 'Support Hours', 'The support hours shown on the contact page.'),
    ('contact_address', '123 Main Street, Suite 100', 'text', 'Contact Address', 'The address shown on the contact page.')
ON CONFLICT (option_name) DO NOTHING;