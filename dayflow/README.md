# Dayflow HR Management System

This is the foundational project skeleton for Dayflow.

## Setup Instructions

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your details:
   ```bash
   cp .env.example .env
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm run dev
   ```

## Development Guidelines

**DO NOT create a second server.js, second DB connection, or second useAuth — import the ones here.**

### Adding New Routes (Backend)
- Add new endpoints for authentication inside `backend/routes/auth.js`.
- Add new endpoints for employees inside `backend/routes/employee.js`.
- Add new endpoints for admins inside `backend/routes/admin.js`.
- The routes are already mounted in `server.js`.

### Adding New Pages (Frontend)
- Build authentication pages in `frontend/src/pages/auth/`.
- Build employee dashboards in `frontend/src/pages/employee/`.
- Build admin dashboards in `frontend/src/pages/admin/`.
- Use the provided `api/client.js` instance for all HTTP requests to auto-attach tokens.
- Use `useAuth()` from `context/AuthContext.jsx` for authentication state.
