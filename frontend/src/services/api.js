import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Request interceptor - Automatically add JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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
      const errorMsg = error.response.data?.message || "Unknown server error";

      if (status >= 500) {
        // Server/DB errors - sanitize and prevent raw DB info
        if (
          errorMsg.toLowerCase().includes("database") ||
          errorMsg.toLowerCase().includes("postgres") ||
          errorMsg.toLowerCase().includes("query") ||
          errorMsg.toLowerCase().includes("connection") ||
          status === 503 ||
          status === 504
        ) {
          error.message =
            "Database temporarily unavailable. Please try again in a moment.";
        } else {
          error.message =
            "Server temporarily unavailable. Please try again shortly.";
        }
        console.error("API Server/DB Error (sanitized):", {
          originalMsg: errorMsg,
          status,
        });
      }
      // Let 4xx through for auth/business logic
    } else if (!error.response) {
      // Network error
      error.message = "Network error. Please check your connection.";
      console.error("API Network Error:", error.message);
    }
    return Promise.reject(error);
  },
);

// Auth
export const register = (data) => API.post("/auth/register", data);
export const verifyOTP = (data) => API.post("/auth/verify-otp", data);
export const login = (data) => API.post("/auth/login", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resendVerificationOTP = (data) => API.post("/auth/resend-otp", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);
export const getMe = () => API.get("/auth/me");

// Center
export const applyForCenterMultipart = (formData) => {
  const config = { headers: { 'Content-Type': 'multipart/form-data' } };
  return API.post("/center/apply", formData, config);
};
export const getMyCenter = () => API.get("/center/my-center");
export const getMyApplication = () => API.get("/center/my-application");
export const getAllCenters = () => API.get("/center/all");
export const getCenterById = (id) => API.get(`/center/${id}`);
export const approveCenter = (id) => API.put(`/center/approve/${id}`);
export const rejectCenter = (id) => API.put(`/center/reject/${id}`);
export const suspendCenter = (id) => API.put(`/center/suspend/${id}`);

// Center Subscription
export const getMySubscription = () => API.get("/center/my-subscription");
export const upgradeSubscription = (planId) =>
  API.post("/center/upgrade-subscription", { plan_id: planId });

// Dashboard Stats - Optimized endpoint
export const getDashboardStats = () => API.get("/center/dashboard-stats");

// Admin APIs (Super Admin role 1 only)
export const getAdminUsers = (params) => API.get('/admin/users', { params });
export const getCentersStats = () => API.get('/admin/centers/stats');
export const getUsersStats = () => API.get('/admin/users/stats');
export const updateUserStatus = (id, status) => API.patch(`/admin/users/${id}/status`, { status });
export const resetUserPassword = (id) => API.post(`/admin/users/${id}/reset-password`);

// Subscription Plans
export const getSubscriptionPlans = () => API.get("/subscription-plans/active");
export const getAllSubscriptionPlans = () => API.get("/subscription-plans/all");
export const getSubscriptionPlanById = (id) =>
  API.get(`/subscription-plans/${id}`);
export const createSubscriptionPlan = (data) =>
  API.post("/subscription-plans", data);
export const updateSubscriptionPlan = (id, data) =>
  API.put(`/subscription-plans/${id}`, data);
export const deleteSubscriptionPlan = (id) =>
  API.delete(`/subscription-plans/${id}`);
export const toggleSubscriptionPlanStatus = (id, data) =>
  API.put(`/subscription-plans/${id}/toggle`, data);

// Academic
export const createCourse = (data) => API.post("/academic/courses", data);
export const getAllCourses = () => API.get("/academic/courses");
export const createBatch = (data) => API.post("/academic/batches", data);
export const getAllBatches = () => API.get("/academic/batches");
export const createSubject = (data) => API.post("/academic/subjects", data);
export const getAllSubjects = () => API.get("/academic/subjects");

// Questions
export const createQuestion = (data) => API.post("/questions", data);
export const getAllQuestions = (filters) =>
  API.get("/questions", { params: filters });
export const getQuestionById = (id) => API.get(`/questions/${id}`);
export const deleteQuestion = (id) => API.delete(`/questions/${id}`);

export const getRandomQuestions = (params) =>
  API.get("/questions/random", { params });
export const updateQuestion = (id, data) => API.put(`/questions/${id}`, data);
export const bulkStatusUpdate = (data) =>
  API.patch("/questions/bulk-status", data);

// Exams
export const createExam = (data) => API.post("/exams", data);
export const getAllExams = () => API.get("/exams");
export const getExamById = (id) => API.get(`/exams/${id}`);
export const getExamQuestions = (id) => API.get(`/exams/${id}/questions`);
export const startExam = (id) => API.put(`/exams/${id}/start`);
export const submitExam = (id, data) => API.post(`/exams/${id}/submit`, data);
export const getResults = (id) => API.get(`/exams/${id}/results`);
export const evaluateWritten = (id) =>
  API.post(`/exams/${id}/evaluate-written`);
export const getAllResults = (id) => API.get(`/exams/${id}/all-results`);
export const joinExam = (data) => API.post("/exams/join", data);
export const exportExamPDF = (id, numSets = 2) =>
  API.get(`/exams/${id}/export-pdf?numSets=${numSets}`, {
    responseType: "blob",
  });

export const updateProfile = (data) => API.put("/auth/profile", data);

export const changePassword = (data) => API.put("/auth/change-password", data);

// Notifications
export const getNotifications = () => API.get("/notifications");
export const getUnreadNotifications = () => API.get("/notifications/unread");
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put("/notifications/read-all");
// AI Question Generation - Enhanced with PDF support
export const aiGenerate = async (data) => {
  // Check if we have a PDF file to upload
  if (data.pdf && data.pdf instanceof File) {
    const formData = new FormData();

    // Add all regular fields to formData
    Object.keys(data).forEach((key) => {
      if (key !== "pdf" && data[key] !== undefined && data[key] !== null) {
        if (Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    // Add the PDF file
    formData.append("pdf", data.pdf);

    return API.post("/questions/ai-generate", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // No PDF, send as JSON
  return API.post("/questions/ai-generate", data);
};

// Regenerate rejected questions with same parameters
export const regenerateQuestions = (data) =>
  API.post("/questions/ai-generate", data);

// Bulk create questions with metadata (for AI generated with filters)
export const bulkCreateQuestionsWithMeta = (data) =>
  API.post("/questions/bulk", data);
export const bulkCreateQuestions = (data) => API.post("/questions/bulk", data);

// Teacher Applications & Assignments
export const applyToCenter = (data) => API.post("/teachers/apply", data);
export const getMyApplications = () => API.get("/teachers/my-applications");
export const getCenterApplications = () => API.get("/teachers/applications");
export const approveApplication = (id) =>
  API.put(`/teachers/applications/${id}/approve`);
export const rejectApplication = (id, data) =>
  API.put(`/teachers/applications/${id}/reject`, data);
export const assignTeacherToCourse = (data) =>
  API.post("/teachers/assignments", data);
export const getMyAssignments = () => API.get("/teachers/my-assignments");
export const getCourseAssignments = (courseId) =>
  API.get(`/teachers/assignments/course/${courseId}`);
export const removeAssignment = (id) =>
  API.put(`/teachers/assignments/${id}/remove`);
export const getAvailableTeachers = () => API.get("/teachers/available");

// Course Enrollments & Payments (NEW API at /api/courses)
export const browseCourses = (filters) =>
  API.get("/courses/browse", { params: filters });
export const enrollInCourse = (courseId) =>
  API.post(`/courses/${courseId}/enroll`);
export const confirmPayment = (courseId, data) =>
  API.post(`/courses/payment/${courseId}/confirm`, data);
export const getMyCourses = () => API.get("/courses/my-courses");
export const getCourseDetail = (courseId) =>
  API.get(`/courses/${courseId}/details`);
export const checkEnrollment = (courseId) =>
  API.get(`/courses/${courseId}/check-enrollment`);
export const getCourseExams = (courseId) =>
  API.get(`/courses/${courseId}/exams`);

// Admin courses (role_id = 2)
export const getAdminCourses = () => API.get("/courses/admin/list");
export const createCourseAdmin = (data) =>
  API.post("/courses/admin/create", data);
export const updateCourseAdmin = (courseId, data) =>
  API.put(`/courses/admin/${courseId}`, data);
export const getCourseStudentsAdmin = (courseId) =>
  API.get(`/courses/admin/${courseId}/students`);

// Legacy enrollments API (kept for backward compatibility)
export const enrollInCourseLegacy = (courseId) =>
  API.post(`/enrollments/courses/${courseId}/enroll`);
export const getPaymentDetails = (enrollmentId) =>
  API.get(`/enrollments/payment/${enrollmentId}`);
export const confirmPaymentLegacy = (data) =>
  API.post("/enrollments/confirm-payment", data);
export const getMyEnrollments = () => API.get("/enrollments/my-enrollments");
export const getMyActiveEnrollments = () =>
  API.get("/enrollments/my-active-enrollments");
export const getCourseStudents = (courseId) =>
  API.get(`/enrollments/courses/${courseId}/students`);
export const browseCoursesLegacy = (coachingCenterId) =>
  API.get("/enrollments/browse", {
    params: { coaching_center_id: coachingCenterId },
  });

// Academic Course Enhancements
export const getActiveCourses = () => API.get("/academic/courses/active");
export const getCoursesForTeacher = () => API.get("/academic/courses/teacher");
export const getCourseWithDetails = (id) =>
  API.get(`/academic/courses/${id}/details`);

export default API;