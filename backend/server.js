const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const shortid = require('shortid');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Upload endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate shortened filename - always use .webp extension
    const shortId = shortid.generate();
    const shortenedFileName = `${shortId}.webp`;

    // Process image with Sharp: convert to WebP for optimal file size
    const processedImage = await sharp(req.file.buffer)
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ 
        quality: 85,
        effort: 6 // Higher effort = better compression (0-6)
      })
      .toBuffer();

    // Upload to S3
    const s3Params = {
      Bucket: BUCKET_NAME,
      Key: shortenedFileName,
      Body: processedImage,
      ContentType: 'image/webp',
      ACL: 'public-read'
    };

    const s3Result = await s3.upload(s3Params).promise();

    // Return frontend URL with shortened path
    const imageUrl = `${FRONTEND_URL}/i/${shortenedFileName}`;

    res.json({
      success: true,
      url: imageUrl,
      imageId: shortId,
      originalSize: req.file.size,
      processedSize: processedImage.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image', message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

