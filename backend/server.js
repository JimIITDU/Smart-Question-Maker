const express = require("express");
const cors = require("cors");
const path = require('path');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Warn if required env variables are missing
const requiredEnvs = [
  'DATABASE_URL',
  'GROQ_API_KEY',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_HOST_USER',
  'EMAIL_HOST_PASSWORD'
];
requiredEnvs.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[ENV WARNING] ${key} is not set!`);
  }
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import multer configuration
const { centerUpload } = require('./config/multerConfig');

// Export for routes
app.locals.centerUpload = centerUpload;

// Routes
const authRoutes = require("./routes/authRoutes");
const centerRoutes = require("./routes/centerRoutes");
const academicRoutes = require("./routes/academicRoutes");
const questionRoutes = require("./routes/questionRoutes");
const examRoutes = require("./routes/examRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const subscriptionPlanRoutes = require("./routes/subscriptionPlanRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes");
const courseEnrollmentRoutes = require("./routes/courseEnrollmentRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/center", centerRoutes);
app.use("/api/academic", academicRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/subscription-plans", subscriptionPlanRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/admin", adminRoutes);

// Course enrollment routes (mounted at /api/courses/enroll)
app.use("/api/courses/enroll", courseEnrollmentRoutes);

// Legacy enrollments route (kept for backward compatibility)
app.use("/api/enrollments", courseEnrollmentRoutes);

// New course management routes
const courseRoutes = require("./routes/courseRoutes");
app.use("/api/courses", courseRoutes);

// Base route
app.get("/", (req, res) => {
  res.json({ message: "Smart Question Maker API is running" });
});

// require('dotenv').config({
//   path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local'
// })

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

