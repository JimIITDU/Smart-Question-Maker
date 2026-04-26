const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy /api/ai/* → Django on port 8000
// Node checks JWT first, then forwards to Django
app.use(
  '/api/ai',
  createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: { '^/api/ai': '/api' },
    on: {
      error: (err, req, res) => {
        res.status(502).json({
          success: false,
          message: 'Django AI service is not running. Start it with: python manage.py runserver 8000',
        });
      },
    },
  })
);

// Your existing routes
const authRoutes = require('./routes/authRoutes');
const centerRoutes = require('./routes/centerRoutes');
const academicRoutes = require('./routes/academicRoutes');
const questionRoutes = require('./routes/questionRoutes');
const examRoutes = require('./routes/examRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/center', centerRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Smart Question Maker API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`AI proxy active: /api/ai/* → http://localhost:8000/api/*`);
});

module.exports = app;