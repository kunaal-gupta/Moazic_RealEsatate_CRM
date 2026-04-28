<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Moazic Real Estate CRM

This repository now contains:
- A **Vite + React** frontend (existing app)
- A **Django backend** configured with **SQLite** in `backend/`

## Frontend (existing)

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env.local`
3. Run:
   `npm run dev`

## Backend (Django + SQLite)

**Prerequisites:** Python 3.10+

1. Create and activate a virtual environment:
   - macOS/Linux: `python3 -m venv .venv && source .venv/bin/activate`
   - Windows (PowerShell): `py -m venv .venv; .venv\Scripts\Activate.ps1`
2. Install dependencies:
   `pip install -r backend/requirements.txt`
3. Run migrations:
   `python manage.py migrate`
4. (Optional) Create admin user:
   `python manage.py createsuperuser`
5. Start server:
   `python manage.py runserver`

Django admin will be available at `http://127.0.0.1:8000/admin/`.
