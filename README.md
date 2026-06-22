# AJMAL's-PHISHING-GUARD

AI-powered phishing detection system with a FastAPI backend, optional DistilBERT inference, explainability hooks, a Next.js dashboard, and a Chrome extension for Gmail.

## What is included

- Backend API for phishing prediction, URL analysis, and explanation endpoints
- Training scaffold for DistilBERT fine-tuning with optional LoRA support
- Next.js frontend dashboard for message and URL inspection
- Chrome extension that flags suspicious Gmail content
- Docker and Redis support for local deployment

## Project layout

```text
phishing-detection-system/
├── backend/
├── training/
├── frontend/
├── extension/
└── README.md
```

## Local development

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:5000` before starting the frontend.

### Docker

```bash
docker compose -f backend/docker-compose.yml up --build
```

## API endpoints

- `GET /health`
- `POST /predict`
- `POST /analyze-url`
- `POST /explain`

## Notes

- If a trained model is present in `backend/phishing_model`, the backend will load it automatically.
- If Redis is unavailable, the backend falls back to an in-memory cache.
- If the ML dependencies are missing, the backend falls back to heuristic scoring so the app still works.


## Training

The training scaffold expects a CSV file with at least a `text` column and an optional `label` column.

