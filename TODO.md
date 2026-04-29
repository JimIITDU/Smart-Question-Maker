# Smart Question Maker SaaS Platform - Complete Development Roadmap

## Overview
Transform the existing Smart Question Maker into a full-featured SaaS platform for multiple coaching centers based on supervisor feedback. Prioritize **Must Have** features first, then **Should Have**, and finally **May Have**.

Current Status: Basic multi-tenant structure exists (centers, RBAC, JWT). AI question generation partially implemented.

## 1. Must Have (Critical - Complete First)
These form the core platform foundation.

### Multi-tenant Architecture
- [x] Verify/enhance coaching center isolation (tenantMiddleware.js) ✅ Already implemented
- [ ] Super Admin center management (ManageCenters.jsx - enhance) 
- [ ] Center-specific data scoping (exams, questions, users) ✅ Already implemented

### LLM-based Written Answer Evaluation
- [x] Integrate LLM service for open-ended grading (llmService.js) ✅ Implemented
- [x] Backend endpoint: `/api/questions/evaluate-written` ✅ Via examController.evaluateWritten
- [x] Frontend: Teacher grading interface in ExamDetails.jsx ✅ Implemented  
- [ ] Student results display written feedback (MyResults.jsx)


### Four-Mode AI Generation
- [ ] Implement Manual mode (existing CreateQuestion.jsx)
- [ ] Random mode: Pure AI generation
- [ ] Guided AI: Teacher provides hints/structure
- [ ] Zero-Shot: Subject-only input
- [ ] UI toggle/mode selector in AIQuestionGenerator.jsx

### Role-Based Access Control (RBAC)
- [ ] Refine roleMiddleware.js (SuperAdmin, Teacher, Student, CoachingAdmin)
- [ ] Center-specific teacher/student restrictions
- [ ] Frontend RoleBasedRoute.jsx enhancements

### JWT Authentication
- [ ] Verify existing auth flow (authController.js, AuthContext.jsx)
- [ ] Refresh token implementation
- [ ] Secure all API routes

## 2. Should Have (High Priority - After Must Haves)
Exam execution and management features.

### Coaching Center Configurations
- [ ] Question Layout toggle (horizontal/vertical) - examModel.js + TakeExam.jsx
- [ ] Question Logic (Skip vs Mandatory) - examController.js
- [ ] Center settings panel (CoachingAdminDashboard.jsx)

### Exam Scheduling & Participation
- [ ] Schedule exams (ManageExams.jsx)
- [ ] Live join functionality (JoinQuiz.jsx, LiveQuiz.jsx)
- [ ] Exam start/end timers

### Automated Marking System
- [ ] Instant MCQ grading (including multi-correct)
- [ ] Written answer LLM grading
- [ ] Results calculation and storage

### PDF Export (Set A/B)
- [ ] Generate Set A/B question papers
- [ ] Download/print functionality
- [ ] Backend PDF service integration

### Difficulty Level Control
- [ ] Easy/Medium/Hard tags in question generation
- [ ] LLM prompt engineering for difficulty
- [ ] Filter/sort by difficulty in QuestionBank.jsx

## 3. May Have (Polish - If Time Permits)
Advanced features for production readiness.

### Student Feedback Loop
- [ ] Rate question clarity post-exam
- [ ] Store feedback for AI training
- [ ] Analytics dashboard for feedback trends

### AI Learning Mechanism
- [ ] Store teacher edits as training data
- [ ] Fine-tune prompts based on corrections
- [ ] 'Improved over time' metrics

### Smart File Management
- [ ] Organized upload system (UploadMaterial.jsx)
- [ ] Material tagging/categorization
- [ ] AI extraction from uploads

### Dashboard Analytics
- [ ] Student performance visualizations
- [ ] Center-wise comparisons
- [ ] Teacher effectiveness metrics (Analytics.jsx)

## Implementation Priority Order
```
1. Must Have (Week 1-2)
   → Core platform ready for demo
   
2. Should Have (Week 3)
   → Full exam lifecycle
   
3. May Have (Week 4+)
   → Production polish
```

## Technical Dependencies
- Backend: MongoDB schema updates (migrateAddCenterId.js → multiCorrect field)
- Frontend: Enhanced forms (React Hook Form validation)
- AI: OpenAI/Groq API keys configured
- Testing: Update existing tests + new exam/grading tests

## Completion Criteria
- [ ] All Must Have features working end-to-end
- [ ] Demo video showing multi-center, AI grading, live exams
- [ ] Production deployment ready (Docker/Docker Compose)
- [ ] Documentation updated (README.md)

**Next Action: Start with Must Have #1 - Verify multi-tenant isolation**

