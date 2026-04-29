import axios from 'axios';

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor - Automatically add JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for centralized error handling to prevent raw DB errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const errorMsg = error.response.data?.message || 'Unknown server error';
      
      if (status >= 500) {
        // Server/DB errors - sanitize and prevent raw DB info
        if (errorMsg.toLowerCase().includes('database') || 
            errorMsg.toLowerCase().includes('postgres') || 
            errorMsg.toLowerCase().includes('query') || 
            errorMsg.toLowerCase().includes('connection') ||
            status === 503 || status === 504) {
          error.message = 'Database temporarily unavailable. Please try again in a moment.';
        } else {
          error.message = 'Server temporarily unavailable. Please try again shortly.';
        }
        console.error('API Server/DB Error (sanitized):', { originalMsg: errorMsg, status });
      }
      // Let 4xx through for auth/business logic
    } else if (!error.response) {
      // Network error
      error.message = 'Network error. Please check your connection.';
      console.error('API Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const verifyOTP = (data) => API.post('/auth/verify-otp', data);
export const login = (data) => API.post('/auth/login', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const getMe = () => API.get('/auth/me');

// Center
export const applyForCenter = (data) => API.post('/center/apply', data);
export const getMyCenter = () => API.get('/center/my-center');
export const getAllCenters = () => API.get('/center/all');
export const approveCenter = (id) => API.put(`/center/approve/${id}`);
export const rejectCenter = (id) => API.put(`/center/reject/${id}`);

// Academic
export const createCourse = (data) => API.post('/academic/courses', data);
export const getAllCourses = () => API.get('/academic/courses');
export const createBatch = (data) => API.post('/academic/batches', data);
export const getAllBatches = () => API.get('/academic/batches');
export const createSubject = (data) => API.post('/academic/subjects', data);
export const getAllSubjects = () => API.get('/academic/subjects');

// Questions
export const createQuestion = (data) => API.post('/questions', data);
export const getAllQuestions = (filters) => API.get('/questions', { params: filters });
export const getQuestionById = (id) => API.get(`/questions/${id}`);
export const deleteQuestion = (id) => API.delete(`/questions/${id}`);

export const getRandomQuestions = (params) => API.get('/questions/random', { params });

// Exams
export const createExam = (data) => API.post('/exams', data);
export const getAllExams = () => API.get('/exams');
export const getExamById = (id) => API.get(`/exams/${id}`);
export const getExamQuestions = (id) => API.get(`/exams/${id}/questions`);
export const startExam = (id) => API.put(`/exams/${id}/start`);
export const submitExam = (id, data) => API.post(`/exams/${id}/submit`, data);
export const getResults = (id) => API.get(`/exams/${id}/results`);
export const evaluateWritten = (id) => API.post(`/exams/${id}/evaluate-written`);
export const getAllResults = (id) => API.get(`/exams/${id}/all-results`);
export const joinExam = (data) => API.post('/exams/join', data);

export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const getUnreadNotifications = () => API.get('/notifications/unread');
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/read-all');

// AI Question Generation
export const aiGenerate = (data) => API.post('/questions/ai-generate', data);
export const bulkCreateQuestions = (data) => API.post('/questions/bulk', data);

export default API;

