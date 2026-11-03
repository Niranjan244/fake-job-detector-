import os
import joblib
import pandas as pd
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from features import JobTextExtractor, JobEngineeredFeatures
from rules import analyze_job

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
ACTIVE_MODEL_PATH = os.path.join(MODELS_DIR, 'active_model.joblib')

_cached_model = None


def get_pipeline(algorithm: str):
    """Constructs the combined FeatureUnion and Classifier pipeline."""
    feature_union = FeatureUnion([
        ('text', Pipeline([
            ('extractor', JobTextExtractor()),
            ('tfidf', TfidfVectorizer(max_features=5000, stop_words='english', ngram_range=(1, 2))),
        ])),
        ('engineered', JobEngineeredFeatures()),
    ])

    if algorithm == 'random_forest':
        classifier = RandomForestClassifier(
            n_estimators=100,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1,
        )
    else:
        classifier = LogisticRegression(
            class_weight='balanced',
            max_iter=1000,
            random_state=42,
        )

    return Pipeline([
        ('features', feature_union),
        ('classifier', classifier),
    ])


def train_model(csv_path: str, algorithm: str = 'logistic_regression') -> dict:
    """Trains a model on the provided CSV and saves it with joblib."""
    global _cached_model

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f'Dataset file not found at: {csv_path}')

    df = pd.read_csv(csv_path)

    if 'fraudulent' not in df.columns:
        raise ValueError("Dataset missing required target column 'fraudulent'")

    # Drop records with invalid or missing targets
    df = df.dropna(subset=['fraudulent'])
    df['fraudulent'] = df['fraudulent'].astype(int)

    X = df
    y = df['fraudulent']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    pipeline = get_pipeline(algorithm)
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)

    metrics = {
        'accuracy': float(round(accuracy_score(y_test, y_pred), 4)),
        'precision': float(round(precision_score(y_test, y_pred, zero_division=0), 4)),
        'recall': float(round(recall_score(y_test, y_pred, zero_division=0), 4)),
        'f1_score': float(round(f1_score(y_test, y_pred, zero_division=0), 4)),
    }

    os.makedirs(MODELS_DIR, exist_ok=True)
    model_save_path = os.path.join(MODELS_DIR, f'{algorithm}_model.joblib')

    joblib.dump(pipeline, model_save_path)
    joblib.dump(pipeline, ACTIVE_MODEL_PATH)

    _cached_model = pipeline

    return {
        'status': 'success',
        'algorithm': algorithm,
        'model_path': model_save_path,
        'metrics': metrics,
    }


def get_active_model():
    """Retrieves the active model instance from memory or disk."""
    global _cached_model
    if _cached_model is not None:
        return _cached_model

    if os.path.exists(ACTIVE_MODEL_PATH):
        _cached_model = joblib.load(ACTIVE_MODEL_PATH)
        return _cached_model

    raise FileNotFoundError('No active trained model available. Please train a model first via /train.')


def predict_job(job: dict) -> dict:
    """Predicts fraud probability and generates rule-based indicators for one job."""
    model = get_active_model()
    df = pd.DataFrame([job])

    probabilities = model.predict_proba(df)[0]
    fraud_prob = float(round(probabilities[1], 4))
    genuine_prob = float(round(probabilities[0], 4))

    label = 'fraudulent' if fraud_prob >= 0.5 else 'genuine'
    confidence = float(round(max(fraud_prob, genuine_prob), 4))
    indicators = analyze_job(job)

    return {
        'label': label,
        'fraud_probability': fraud_prob,
        'confidence': confidence,
        'indicators': indicators,
    }


def predict_batch(jobs: list) -> list:
    """Predicts fraud probability and generates indicators for a batch of jobs."""
    model = get_active_model()
    df = pd.DataFrame(jobs)

    probabilities = model.predict_proba(df)

    results = []
    for i, job in enumerate(jobs):
        fraud_prob = float(round(probabilities[i][1], 4))
        genuine_prob = float(round(probabilities[i][0], 4))
        label = 'fraudulent' if fraud_prob >= 0.5 else 'genuine'
        confidence = float(round(max(fraud_prob, genuine_prob), 4))
        indicators = analyze_job(job)

        results.append({
            'label': label,
            'fraud_probability': fraud_prob,
            'confidence': confidence,
            'indicators': indicators,
        })

    return results
