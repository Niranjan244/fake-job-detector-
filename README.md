# Fake Job Posting & Recruitment Fraud Detector

An end-to-end full-stack web application and machine learning engine designed to classify fraudulent job listings, flag suspicious recruitment indicators, and provide administrative dataset management and model lifecycle retraining.

---

## Architecture Overview

```text
fake-job-detector/
├── client/        # React (Vite) + Tailwind CSS + Recharts Single Page Application
├── server/        # Node.js + Express + Mongoose REST API Gateway
└── ml-service/    # Python FastAPI + scikit-learn TF-IDF & Feature Pipeline
```

---

## Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **Python**: 3.10, 3.11, or 3.12
- **MongoDB**: Local MongoDB instance (port 27017) or MongoDB Atlas Cloud Cluster

---

## Local Setup & Development

### 1. Python ML Service Setup

```powershell
cd fake-job-detector/ml-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- Interactive API Docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

---

### 2. Express Server Setup

```powershell
cd fake-job-detector/server
npm install
npm run dev
```

#### Environment Variables (`server/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/fake_job_detector
JWT_SECRET=supersecretjwtkey_change_in_production
ML_SERVICE_URL=http://127.0.0.1:8000
```

---

### 3. React Client Setup

```powershell
cd fake-job-detector/client
npm install
npm run dev
```

#### Environment Variables (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
The client will be running at `http://localhost:3000`.

---

## How to Create an Administrator Account

1. Start both the client and server.
2. Open `http://localhost:3000/register` and register a standard user account.
3. Open your terminal and run the one-time elevation script in the server directory:
   ```powershell
   cd fake-job-detector/server
   node scripts/makeAdmin.js your-registered-email@example.com
   ```
4. Log out and log back in on the web app. The **Admin Panel** tab will now appear in your navigation bar.

---

## How to Train the First Model

1. Log into your promoted Admin account and open the **Admin Panel** (`http://localhost:3000/admin`).
2. Go to the **Datasets** tab.
3. Upload a CSV dataset (e.g. Kaggle Fake Job Postings dataset) that includes a target column named `fraudulent` (0 for genuine, 1 for fraudulent).
4. Go to the **Model Training** tab.
5. Select your uploaded dataset, choose an algorithm (`Logistic Regression` or `Random Forest`), check *Set as active model*, and click **Start Model Training**.
6. The ML service will execute an 80/20 stratified split, compute Accuracy, Precision, Recall, and F1 Score, and save the active model pipeline using `joblib`.

---

## Running Automated Tests

Run the backend integration test suite (using isolated test database):

```powershell
cd fake-job-detector/server
npm test
```

---

## Production Deployment Guide

### 1. MongoDB Atlas (Database)
1. Create a free M0 cluster on [MongoDB Atlas](https://cloud.mongodb.com).
2. Create a Database User with read/write access.
3. Whitelist Network Access to allow `0.0.0.0/0` (or your cloud host's outbound IPs).
4. Copy your connection string into the Server environment.

---

### 2. ML Service (Railway or Render)
Deploy `fake-job-detector/ml-service` as a Python web service (or using the included `Dockerfile`).
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `PORT`: Assigned automatically by Railway/Render (e.g., `8000`)

---

### 3. Server (Railway or Render)
Deploy `fake-job-detector/server` as a Node.js web service.
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Environment Variables**:
  - `PORT`: `5000` (or platform default)
  - `NODE_ENV`: `production`
  - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/fake_job_detector?retryWrites=true&w=majority`
  - `JWT_SECRET`: Random 64-character secret key
  - `ML_SERVICE_URL`: URL of your deployed ML service (e.g. `https://ml-service.up.railway.app`)

---

### 4. Client (Vercel or Netlify)
Deploy `fake-job-detector/client` as a Single Page Application.
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **SPA Rewrites**: Pre-configured in `vercel.json` and `public/_redirects`.
- **Environment Variables**:
  - `VITE_API_BASE_URL`: URL of your deployed Express backend (e.g. `https://server.up.railway.app/api`)
