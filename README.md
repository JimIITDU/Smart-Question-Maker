# Smart Question Maker

AI-powered MCQ generation and examination 
platform for coaching centers.

## Tech Stack
- Frontend: React.js + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MySQL
- Auth: JWT
- Testing: Jest + Supertest
- AI Service: Django + FastAPI (coming soon)

## Project Setup

### Prerequisites
- Node.js v18+
- MySQL
- npm

### Backend Setup
cd backend
npm install
cp .env.example .env
# Fill in your credentials
npm run dev

### Frontend Setup
cd frontend
npm install
npm run dev

### Database Setup
1. Create MySQL database: smart_question_maker
2. Run database/schema.sql

### Running Tests
cd backend
npm test

## API Endpoints

### Authentication
POST /api/auth/register
POST /api/auth/verify-otp
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me

### Coaching Center
POST /api/center/apply
GET  /api/center/all
GET  /api/center/my-center
PUT  /api/center/approve/:id
PUT  /api/center/reject/:id
PUT  /api/center/update/:id

### Academic Structure
POST /api/academic/courses
GET  /api/academic/courses
PUT  /api/academic/courses/:id
DELETE /api/academic/courses/:id
POST /api/academic/batches
GET  /api/academic/batches
POST /api/academic/subjects
GET  /api/academic/subjects
POST /api/academic/enroll

### Question Bank
POST /api/questions
GET  /api/questions
GET  /api/questions/:id
PUT  /api/questions/:id
DELETE /api/questions/:id
POST /api/questions/bulk
GET  /api/questions/random

### Exams
POST /api/exams
GET  /api/exams
GET  /api/exams/:id
GET  /api/exams/:id/questions
PUT  /api/exams/:id/start
PUT  /api/exams/:id/end
POST /api/exams/join
POST /api/exams/:id/submit
GET  /api/exams/:id/results

### Notifications
POST /api/notifications
POST /api/notifications/broadcast
GET  /api/notifications
GET  /api/notifications/unread
PUT  /api/notifications/:id/read
PUT  /api/notifications/read-all
DELETE /api/notifications/:id

## Team
- Akidul Islam Jim (Roll: BSSE 1519)
  → Frontend + Backend
- Md. Merajul Islam (Roll: BSSE 1502)
  → AI Service + Django

## Supervisor
Md. Saeed Siddik
Assistant Professor, IIT
University of Dhaka
```

---

### 2. Create `.env.example`

Create `backend/.env.example`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smart_question_maker
JWT_SECRET=your_secret_key_here