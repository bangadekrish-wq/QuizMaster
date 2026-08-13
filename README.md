# QuizMaster – Quiz Management & Online Assessment Platform 🎓⚡

QuizMaster is a full-stack, desktop-first online assessment and quiz management web application. It features a modern Microsoft Store-inspired dark interface connected to a high-performance Node.js + Express + PostgreSQL backend.

---

## 🏗️ Architecture Overview

```
React Frontend (Vite + Tailwind CSS + Axios + Recharts)
           ↓  REST API Requests (Authorization: Bearer <JWT>)
Node.js + Express REST API Server (Port 5000)
           ↓  Security: Helmet, CORS, Rate Limiting, Zod Validation, Bcrypt
PostgreSQL Database (Users, Categories, Quizzes, Questions, Options, Attempts, Answers)
```

---

## 🗄️ Database Schema (PostgreSQL)

The database schema (`backend/database/migrations/001_initial_schema.sql`) contains 7 relational tables:

- **`users`**: UUID primary key, `name`, `email` (UNIQUE), `password_hash` (bcrypt), `role` (`ADMIN` / `STUDENT`), `status` (`ACTIVE` / `INACTIVE`).
- **`categories`**: `id`, `name` (UNIQUE), `description`.
- **`quizzes`**: `id`, `title`, `description`, `category_id` (FK), `difficulty` (`EASY`, `MEDIUM`, `HARD`), `duration_minutes`, `passing_score`, `max_attempts`, `status` (`DRAFT`, `PUBLISHED`, `UNPUBLISHED`), `created_by` (FK).
- **`questions`**: `id`, `quiz_id` (FK), `question_text`, `marks`, `explanation`, `difficulty`, `question_type` (`MULTIPLE_CHOICE`).
- **`options`**: `id`, `question_id` (FK), `option_text`, `is_correct` (BOOLEAN).
- **`attempts`**: `id`, `quiz_id` (FK), `user_id` (FK), `score`, `total_marks`, `percentage`, `correct_answers`, `incorrect_answers`, `unanswered`, `time_taken_seconds`, `status` (`IN_PROGRESS`, `COMPLETED`, `AUTO_SUBMITTED`, `ABANDONED`), `started_at`, `expires_at`, `completed_at`.
- **`answers`**: `id`, `attempt_id` (FK), `question_id` (FK), `selected_option_id` (FK), `is_correct`, `marks_awarded`.

---

## 🔐 Security Features

1. **Anti-Cheat Answer Protection**: Correct answers (`is_correct`) are stripped from quiz-start endpoints and NEVER sent to student browsers.
2. **Server-Side Timer Validation**: Attempt expiration (`expires_at`) is calculated and enforced on the server. If server time exceeds `expires_at`, the attempt is evaluated as `AUTO_SUBMITTED`.
3. **Server-Side Scoring Engine**: Score, percentage, correct count, and pass/fail status are evaluated strictly on the backend.
4. **JWT & Bcrypt Hashing**: Password hashes are generated with bcrypt. JWT tokens contain non-sensitive user identity payloads (`userId`, `role`).
5. **Role-Based Guards**: Admin endpoints (`/api/quizzes`, `/api/users`, `/api/admin/*`) require `ADMIN` role. Public registration endpoint defaults strictly to `STUDENT`.

---

## ⚡ Quick Start Instructions

### 1. Backend Setup (`/backend`)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run database seed script (provisions initial Admin & Categories)
npm run seed

# Start development server (Port 5000)
npm run dev
```

- **Health Check**: `http://localhost:5000/api/health`
- **Default Admin Credentials**:
  - Email: `admin@quizmaster.io`
  - Password: `adminpassword123`

---

### 2. Frontend Setup (`/frontend`)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server (Port 5173)
npm run dev
```

- Access application at: `http://localhost:5173`

---

## 📡 REST API Summary

### Auth APIs
- `POST /api/auth/register` (Student Registration)
- `POST /api/auth/login` (Student Login)
- `POST /api/auth/admin/login` (Admin Login)
- `GET /api/auth/me` (Current Session)

### Quiz APIs
- `GET /api/quizzes` (List Quizzes - Students see only Published)
- `GET /api/quizzes/:id` (Quiz Details)
- `POST /api/quizzes` (Admin Create Quiz)
- `PUT /api/quizzes/:id` (Admin Edit Quiz)
- `DELETE /api/quizzes/:id` (Admin Delete Quiz)
- `PATCH /api/quizzes/:id/publish` (Admin Publish Status)

### Attempt APIs
- `POST /api/quizzes/:quizId/start` (Initialize Student Attempt & Timer)
- `POST /api/quizzes/:quizId/submit` (Evaluate & Finalize Attempt)
- `GET /api/attempts` (Attempt History)
- `GET /api/attempts/:id` (Attempt Result & Breakdown Review)

### Analytics & Dashboards
- `GET /api/student/dashboard` (Student Performance Telemetry)
- `GET /api/admin/dashboard` (Admin Overview Telemetry)
- `GET /api/admin/analytics` (Recharts Aggregated Telemetry)
- `GET /api/leaderboard` (Real Calculated Student Rankings)
