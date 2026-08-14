-- Add admin settings for the /privacy page.
-- The privacy policy content is stored as HTML in admin_settings and supports
-- shortcodes like [site_title], [company_name], [support_email], etc.
-- These are replaced at render time by the shortcode utility.

INSERT INTO public.admin_settings (option_name, option_value, option_field_type, option_title, option_description)
VALUES
    (
        'privacy_policy',
        '<h1>Privacy Policy</h1><p>Last Updated: August 14, 2026</p><h2>1. Introduction</h2><p>This Privacy Policy explains how [site_title] ("we", "us", or "our") collects, uses, discloses, and safeguards your information when you use our services. By accessing or using our services, you acknowledge that you have read and understood this Privacy Policy.</p><h2>2. Information We Collect</h2><h3>2.1 Personal Information</h3><ul><li>Email address</li><li>Account credentials</li><li>Payment information (processed by our payment providers)</li><li>Usage data</li></ul><h3>2.2 Technical Information</h3><ul><li>IP address</li><li>Browser type and version</li><li>Device information</li><li>Cookies and similar technologies</li></ul><h2>3. How We Use Your Information</h2><p>We use the information we collect to:</p><ul><li>Provide and maintain our services</li><li>Process transactions and payments</li><li>Improve and personalize your experience</li><li>Communicate with you about updates and support</li><li>Analyze usage patterns to enhance our services</li><li>Prevent fraud and ensure security</li></ul><h2>4. Data Storage and Security</h2><p>We implement appropriate technical and organizational measures to protect your personal information, including encryption in transit and at rest, access controls, and regular security reviews. While we strive to protect your data, no method of transmission over the internet is 100% secure.</p><h2>5. Data Sharing and Disclosure</h2><p>We do not sell your personal information. We may share your information with:</p><ul><li>Service providers who assist in operating our services (e.g., hosting, payment processing)</li><li>Legal authorities when required by law or to protect our rights</li><li>Business partners with your consent</li></ul><h2>6. Your Rights</h2><p>Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict the processing of your personal information. To exercise these rights, contact us at [support_email].</p><h2>7. Cookies</h2><p>We use cookies and similar technologies to enhance your experience, analyze traffic, and remember your preferences. You can control cookies through your browser settings.</p><h2>8. Third-Party Services</h2><p>Our services may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties.</p><h2>9. Children''s Privacy</h2><p>Our services are not directed to children under the age of 13, and we do not knowingly collect personal information from children.</p><h2>10. Changes to This Privacy Policy</h2><p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p><h2>11. Contact Us</h2><p>If you have any questions about this Privacy Policy, please contact us at [support_email].</p>',
        'textarea',
        'Privacy Policy',
        'The privacy policy content shown on the /privacy page. Supports shortcodes like [site_title], [company_name], and [support_email].'
    ),
    (
        'company_name',
        'Resume Builder',
        'text',
        'Company Name',
        'The legal company name. Available as the [company_name] shortcode.'
    )
ON CONFLICT (option_name) DO NOTHING;