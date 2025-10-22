const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + fileExtension;
    cb(null, filename);
  }
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, images, and text files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   POST /api/uploads
// @desc    Upload a file and optionally associate with a project (projectId in body)
// @access  Private
router.post('/', auth, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'File too large. Maximum size is 10MB.'
        });
      }
      return res.status(400).json({
        message: 'Upload error: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/api/uploads/${req.file.filename}`;

    // If projectId provided, attach metadata to project.files
    const projectId = req.body.projectId || req.query.projectId;
    if (projectId) {
      try {
        const Project = require('../models/Project');
        const proj = await Project.findById(projectId);
        if (proj) {
          proj.files = proj.files || [];
          proj.files.push({
            filename: req.file.filename,
            originalName: req.file.originalname,
            url: fileUrl,
            mimeType: req.file.mimetype,
            size: req.file.size,
            uploadedAt: new Date()
          });
          await proj.save();
        }
      } catch (e) {
        console.error('Failed to attach file to project:', e);
      }
    }

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: fileUrl,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      }
    });
  });
});

// @route   GET /api/uploads/:filename
// @desc    Serve uploaded files
// @access  Public (but you could add auth if needed)
router.get('/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      message: 'File not found'
    });
  }

  // Serve the file
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error serving file:', err);
      res.status(500).json({
        message: 'Error serving file'
      });
    }
  });
});

// @route   DELETE /api/uploads/:filename
// @desc    Delete an uploaded file
// @access  Private
router.delete('/:filename', auth, async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      message: 'File not found'
    });
  }

  try {
    // Remove file from disk
    fs.unlinkSync(filePath);

    // Also remove any references from projects.files
    try {
      const Project = require('../models/Project');
      await Project.updateMany({ 'files.filename': filename }, { $pull: { files: { filename } } });
    } catch (e) {
      console.error('Failed to remove file reference from projects:', e);
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      message: 'Error deleting file'
    });
  }
});

module.exports = router;
