import re
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from rules import SUSPICIOUS_KEYWORDS, FREE_EMAIL_DOMAINS


def clean_text(text: str) -> str:
    if not text or pd.isna(text):
        return ''
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()


class JobTextExtractor(BaseEstimator, TransformerMixin):
    """Combines key text fields into a single cleaned text sequence."""

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        if isinstance(X, list):
            X = pd.DataFrame(X)

        title = X.get('title', pd.Series('', index=X.index)).fillna('')
        profile = X.get('company_profile', pd.Series('', index=X.index)).fillna('')
        desc = X.get('description', pd.Series('', index=X.index)).fillna('')
        req = X.get('requirements', pd.Series('', index=X.index)).fillna('')
        benefits = X.get('benefits', pd.Series('', index=X.index)).fillna('')

        combined = (
            title.astype(str)
            + ' '
            + profile.astype(str)
            + ' '
            + desc.astype(str)
            + ' '
            + req.astype(str)
            + ' '
            + benefits.astype(str)
        )
        return combined.apply(clean_text)


class JobEngineeredFeatures(BaseEstimator, TransformerMixin):
    """Extracts domain-specific engineered indicators as numerical features."""

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        if isinstance(X, list):
            X = pd.DataFrame(X)

        # 1. Missing company profile
        profile = X.get('company_profile', pd.Series('', index=X.index)).fillna('')
        missing_profile = (profile.astype(str).str.strip() == '').astype(int)

        # 2. Missing logo
        logo = X.get('has_company_logo', pd.Series(0, index=X.index)).fillna(0)
        missing_logo = (logo.astype(int) == 0).astype(int)

        # 3. Salary present
        salary = X.get('salary_range', pd.Series('', index=X.index)).fillna('')
        salary_present = (salary.astype(str).str.strip() != '').astype(int)

        # Text fields for domain and keyword inspection
        desc = X.get('description', pd.Series('', index=X.index)).fillna('')
        recruiter_email = X.get('recruiter_email', pd.Series('', index=X.index)).fillna('')
        combined_meta = (
            profile.astype(str) + ' ' + desc.astype(str) + ' ' + recruiter_email.astype(str)
        ).str.lower()

        # 4. Free email domain present
        free_email_pattern = r'@(' + '|'.join(re.escape(d) for d in FREE_EMAIL_DOMAINS) + r')'
        free_email = combined_meta.str.contains(free_email_pattern, regex=True, na=False).astype(int)

        # 5. Number of suspicious keywords
        def count_keywords(text):
            return sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in text)

        suspicious_count = combined_meta.apply(count_keywords)

        return np.column_stack([
            missing_profile,
            missing_logo,
            salary_present,
            free_email,
            suspicious_count,
        ])
