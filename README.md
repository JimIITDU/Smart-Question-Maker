# Smart Question Maker

An intelligent multi-tenant educational platform for coaching centers.

## 🌐 Live URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://smart-question-maker.vercel.app |
| **Backend API** | https://smart-question-maker-backend.onrender.com |
| **Database** | Neon PostgreSQL (ep-mute-unit-a4nthh29-pooler.us-east-1.aws.neon.tech) |

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (Neon) |
| Authentication | JWT Tokens |
| Frontend Host | Vercel |
| Backend Host | Render |

---

## 📁 Project Structure

```
smartquestionmaker/
├── frontend/          # React + Vite app (hosted on Vercel)
├── backend/           # Node.js + Express API (hosted on Render)
│   ├── config/        # Database connection
│   ├── controllers/   # Route handlers
│   ├── middleware/    # Auth & role middleware
│   ├── models/        # Database queries
│   ├── routes/        # API routes
│   └── scripts/       # Utility scripts
└── database/          # PostgreSQL schema
```

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Forgot password |
| POST | `/api/auth/reset-password` | Reset password |
| PUT | `/api/auth/change-password` | Change password |
| PUT | `/api/auth/profile` | Update profile |

### Coaching Center
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/center/apply` | Apply for center |
| GET | `/api/center` | Get all centers |
| GET | `/api/center/my` | Get my center |
| GET | `/api/center/:id` | Get center by ID |
| PUT | `/api/center/:id` | Update center |
| PUT | `/api/center/:id/approve` | Approve center |
| PUT | `/api/center/:id/reject` | Reject center |
| PUT | `/api/center/:id/suspend` | Suspend center |

### Academic
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/academic/courses` | Create course |
| GET | `/api/academic/courses` | Get all courses |
| PUT | `/api/academic/courses/:id` | Update course |
| DELETE | `/api/academic/courses/:id` | Delete course |
| POST | `/api/academic/batches` | Create batch |
| GET | `/api/academic/batches` | Get all batches |
| PUT | `/api/academic/batches/:id` | Update batch |
| DELETE | `/api/academic/batches/:id` | Delete batch |
| POST | `/api/academic/enroll` | Enroll student |
| GET | `/api/academic/batches/:id/students` | Get batch students |
| POST | `/api/academic/subjects` | Create subject |
| GET | `/api/academic/subjects` | Get all subjects |

### Questions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/questions` | Create question |
| GET | `/api/questions` | Get all questions |
| GET | `/api/questions/:id` | Get question by ID |
| PUT | `/api/questions/:id` | Update question |
| DELETE | `/api/questions/:id` | Delete question |
| POST | `/api/questions/bulk` | Bulk create questions |
| GET | `/api/questions/random` | Get random questions |

### Exams
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/exams` | Create exam |
| GET | `/api/exams` | Get all exams |
| GET | `/api/exams/:id` | Get exam by ID |
| GET | `/api/exams/:id/questions` | Get exam questions |
| PUT | `/api/exams/:id/start` | Start exam |
| PUT | `/api/exams/:id/end` | End exam |
| POST | `/api/exams/join` | Join by access code |
| POST | `/api/exams/:id/submit` | Submit answers |
| GET | `/api/exams/:id/results` | Get results |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications` | Create notification |
| POST | `/api/notifications/broadcast` | Broadcast notification |
| GET | `/api/notifications` | Get my notifications |
| GET | `/api/notifications/unread` | Get unread |
| PUT | `/api/notifications/read-all` | Mark all as read |
| PUT | `/api/notifications/:id/read` | Mark one as read |
| DELETE | `/api/notifications/:id` | Delete notification |

---

## 👥 User Roles

| Role ID | Role | Description |
|---------|------|-------------|
| 1 | Super Admin | Full platform control |
| 2 | Coaching Admin | Manages their center |
| 3 | Teacher | Creates exams & questions |
| 4 | Staff | Administrative support |
| 5 | Student | Takes exams |
| 6 | Parent | Views student results |

---

## 🗄️ Database Tables

- `roles` — User roles
- `coaching_center` — Coaching centers
- `users` — All users
- `subscription` — Payments & subscriptions
- `course` — Courses
- `batch` — Batches
- `batch_enrollment` — Student-batch relationships
- `subjects` — Subjects & study materials
- `question_bank` — Questions
- `quiz_exam` — Exams & quizzes
- `exam_questions` — Exam-question relationships
- `result_summary` — Student results
- `notification` — Notifications

---

## 💻 Local Development

### Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🔧 Environment Variables

### Backend (`backend/config/db.js`)
- `DATABASE_URL` — Neon PostgreSQL connection string
- `JWT_SECRET` — JWT signing secret
- `NODE_ENV` — `development` or `production`
- `PORT` — Server port (default 5000)

### Frontend (`frontend/.env`)
- `VITE_API_URL` — Backend API URL

---

## 📋 Submitted By

| Name | Roll |
|------|------|
| Md. Merajul Islam | BSSE 1502 |
| Akidul Islam Jim | BSSE 1519 |

**Supervised by:** Md. Saeed Siddik  
**Course:** SE-3105 Software Project Lab 2  
**Institute:** Institute of Information Technology, University of Dhaka