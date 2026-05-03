const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/authRoutes");
const centerRoutes = require("./routes/centerRoutes");
const academicRoutes = require("./routes/academicRoutes");
const questionRoutes = require("./routes/questionRoutes");
const examRoutes = require("./routes/examRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const subscriptionPlanRoutes = require("./routes/subscriptionPlanRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const courseEnrollmentRoutes = require("./routes/courseEnrollmentRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/center", centerRoutes);
app.use("/api/academic", academicRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/subscription-plans", subscriptionPlanRoutes);
app.use("/api/teachers", teacherRoutes);

// Course enrollment routes (mounted at /api/courses)
app.use("/api/courses", courseEnrollmentRoutes);

// Legacy enrollments route (kept for backward compatibility)
app.use("/api/enrollments", courseEnrollmentRoutes);

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
