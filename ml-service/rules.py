import re

SUSPICIOUS_KEYWORDS = [
    'registration fee',
    'security deposit',
    'processing fee',
    'wire transfer',
    'western union',
    'money order',
    'no interview',
    'immediate start without interview',
    'urgent hiring',
    'work from home easy money',
    'guaranteed income',
    'unlimited earning potential',
    'envelope stuffing',
    'crypto payment',
    'bitcoin payment',
    'investment required',
    'earn $$$',
]

SENSITIVE_DATA_KEYWORDS = [
    'aadhaar',
    'bank details',
    'bank account number',
    'passport copy',
    'credit card',
    'debit card',
    'cvv',
    'otp',
    'social security number',
    'ssn',
]

FREE_EMAIL_DOMAINS = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'rediffmail.com',
    'icloud.com',
    'protonmail.com',
]

MESSAGING_APPS = ['telegram', 'whatsapp', 'signal']


def analyze_job(job: dict) -> list:
    """Evaluates rule-based indicators against a job posting."""
    indicators = []

    # Aggregate text for keyword scans
    text_fields = [
        job.get('title', ''),
        job.get('company_name', ''),
        job.get('company_profile', ''),
        job.get('description', ''),
        job.get('requirements', ''),
        job.get('benefits', ''),
        job.get('application_method', ''),
    ]
    combined_text = ' '.join(str(f or '') for f in text_fields).lower()

    # 1. Suspicious fee / urgency keywords
    matched_suspicious = [
        kw for kw in SUSPICIOUS_KEYWORDS if kw in combined_text
    ]
    if matched_suspicious:
        high_severity_terms = {
            'registration fee',
            'security deposit',
            'processing fee',
            'wire transfer',
            'western union',
            'investment required',
        }
        has_high = any(kw in high_severity_terms for kw in matched_suspicious)
        indicators.append(
            {
                'type': 'suspicious_keywords',
                'detail': f"Detected suspicious phrases: {', '.join(matched_suspicious)}",
                'severity': 'high' if has_high else 'medium',
            }
        )

    # 2. Sensitive personal data or banking requests
    matched_sensitive = [
        kw for kw in SENSITIVE_DATA_KEYWORDS if kw in combined_text
    ]
    if matched_sensitive:
        indicators.append(
            {
                'type': 'sensitive_data_request',
                'detail': f"Requests sensitive personal/financial information: {', '.join(matched_sensitive)}",
                'severity': 'high',
            }
        )

    # 3. Recruiter email domain check
    recruiter_email = str(job.get('recruiter_email') or '').lower().strip()
    if recruiter_email:
        domain = recruiter_email.split('@')[-1] if '@' in recruiter_email else ''
        if domain in FREE_EMAIL_DOMAINS:
            indicators.append(
                {
                    'type': 'free_email_domain',
                    'detail': f'Recruiter contact uses free email service: {domain}',
                    'severity': 'medium',
                }
            )

    # 4. Messaging apps only contact
    contact_field = (
        f"{job.get('recruiter_contact', '')} {job.get('application_method', '')} {combined_text}"
    ).lower()
    matched_apps = [app for app in MESSAGING_APPS if app in contact_field]
    if matched_apps and not job.get('company_profile'):
        indicators.append(
            {
                'type': 'messaging_app_contact',
                'detail': f"Directs applicants to external messaging apps ({', '.join(matched_apps)}) without formal company profile",
                'severity': 'high',
            }
        )

    # 5. Missing company profile or logo
    has_profile = bool(str(job.get('company_profile') or '').strip())
    has_logo = bool(job.get('has_company_logo'))
    if not has_profile:
        indicators.append(
            {
                'type': 'missing_company_profile',
                'detail': 'No company profile or background information provided',
                'severity': 'low' if has_logo else 'medium',
            }
        )
    if not has_logo:
        indicators.append(
            {
                'type': 'missing_company_logo',
                'detail': 'Job posting does not include a verified company logo',
                'severity': 'low',
            }
        )

    # 6. Unrealistic salary vs entry role
    title = str(job.get('title') or '').lower()
    salary = str(job.get('salary_range') or '').lower()
    entry_level_roles = [
        'data entry',
        'typing',
        'assistant',
        'copy paste',
        'fresher',
    ]
    is_entry = any(role in title for role in entry_level_roles)

    # Check for excessive pay figures in salary string (e.g. 100000+ or high hourly rates)
    salary_numbers = [int(n) for n in re.findall(r'\b\d{4,7}\b', salary)]
    if is_entry and salary_numbers and max(salary_numbers) >= 100000:
        indicators.append(
            {
                'type': 'unrealistic_compensation',
                'detail': f'Disproportionately high compensation ({salary}) for entry-level title: {title}',
                'severity': 'high',
            }
        )

    return indicators
