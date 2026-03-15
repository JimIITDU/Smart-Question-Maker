const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const centerRoutes = require('./routes/centerRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/center', centerRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Smart Question Maker API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});