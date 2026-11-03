from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from model import train_model, predict_job, predict_batch

app = FastAPI(title="Fake Job Posting & Recruitment Fraud Detector ML Engine")


def normalize_job_dict(job: dict) -> dict:
    """Ensures compatibility between camelCase client input and snake_case dataset columns."""
    normalized = dict(job)
    key_map = {
        'companyName': 'company_name',
        'companyProfile': 'company_profile',
        'salaryRange': 'salary_range',
        'employmentType': 'employment_type',
        'recruiterEmail': 'recruiter_email',
        'recruiterContact': 'recruiter_contact',
        'applicationMethod': 'application_method',
        'hasCompanyLogo': 'has_company_logo',
    }
    for camel, snake in key_map.items():
        if camel in normalized and snake not in normalized:
            normalized[snake] = normalized[camel]
        elif snake in normalized and camel not in normalized:
            normalized[camel] = normalized[snake]
    return normalized


class TrainRequest(BaseModel):
    csv_path: str
    algorithm: str = 'logistic_regression'


class IndicatorResponse(BaseModel):
    type: str
    detail: str
    severity: str


class PredictionResponse(BaseModel):
    label: str
    fraud_probability: float
    confidence: float
    indicators: List[IndicatorResponse]


class JobPosting(BaseModel):
    title: str = ''
    company_name: Optional[str] = ''
    company_profile: Optional[str] = ''
    description: Optional[str] = ''
    requirements: Optional[str] = ''
    benefits: Optional[str] = ''
    salary_range: Optional[str] = ''
    location: Optional[str] = ''
    employment_type: Optional[str] = ''
    recruiter_email: Optional[str] = ''
    recruiter_contact: Optional[str] = ''
    application_method: Optional[str] = ''
    telecommuting: Optional[int] = 0
    has_company_logo: Optional[int] = 0
    has_questions: Optional[int] = 0

    model_config = {'extra': 'allow'}


class BatchPredictionRequest(BaseModel):
    jobs: List[JobPosting]


@app.get('/health')
async def health_check():
    return {'status': 'ok', 'service': 'ml-service'}


@app.post('/train')
async def train(payload: TrainRequest):
    allowed_algorithms = {'logistic_regression', 'random_forest'}
    if payload.algorithm not in allowed_algorithms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Algorithm must be one of {allowed_algorithms}",
        )

    try:
        result = train_model(payload.csv_path, payload.algorithm)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post('/predict', response_model=PredictionResponse)
async def predict(job: JobPosting):
    try:
        job_data = normalize_job_dict(job.model_dump())
        return predict_job(job_data)
    except FileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post('/predict-batch', response_model=List[PredictionResponse])
async def predict_batch_endpoint(payload: BatchPredictionRequest):
    if not payload.jobs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payload must contain a non-empty list of jobs",
        )

    try:
        jobs_data = [normalize_job_dict(j.model_dump()) for j in payload.jobs]
        return predict_batch(jobs_data)
    except FileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
