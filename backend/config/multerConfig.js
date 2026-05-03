const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, '../uploads', 'centers');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage for centers
const centerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const centerUpload = multer({ 
  storage: centerStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(new Error('Only JPG/PNG allowed'), false);
    }
  }
});

module.exports = {
  centerUpload
};
