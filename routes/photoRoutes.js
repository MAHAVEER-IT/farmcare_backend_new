import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function(req, file, cb) {
    console.log('Processing file:', file);
    
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
}).single('image'); // Important: 'image' must match the field name in the request

// Handle file upload
router.post('/upload', auth, (req, res) => {
  console.log('Upload request received');
  console.log('Request headers:', req.headers);
  
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      console.error('No file received');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('File received:', req.file);
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.status(201).json({
      success: true,
      imageUrl,
      message: 'Image uploaded successfully'
    });
  });
});

// Serve uploaded images
router.get('/:filename', (req, res) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  res.sendFile(path.join(uploadsDir, req.params.filename), (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
  });
});

export default router;
