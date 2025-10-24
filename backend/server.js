const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const noteRoutes = require('./routes/notes');
const uploadRoutes = require('./routes/uploads');
const inviteRoutes = require('./routes/invites');

// Create Express app
const app = express();

// Middleware
// Configure CORS with environment-driven allowed origins so production
// frontends can be explicitly whitelisted and we can enable credentials
// handling if needed. Set CORS_ORIGIN in your environment to a comma
// separated list like: https://example.com,https://staging.example.com
const rawCors = process.env.CORS_ORIGIN || '';
const allowedOrigins = rawCors.split(',').map(s => s.trim()).filter(Boolean);

app.use((req, res, next) => {
  // Helpful debug output when investigating CORS issues
  console.log('Incoming Origin header:', req.headers.origin);
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    // If no origin (e.g., server-to-server or curl), allow it
    if (!origin) return callback(null, true);
    // If no list was provided, allow all origins (preserve previous behavior)
    if (allowedOrigins.length === 0) return callback(null, true);
    // Otherwise only allow origins that exactly match the list
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  // If your frontend uses cookies or you want to send credentials, set to true
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files for uploads. Allow configuring the uploads directory via UPLOADS_DIR
const uploadsPath = process.env.UPLOADS_DIR ? path.resolve(process.env.UPLOADS_DIR) : path.join(__dirname, 'uploads');
// Ensure the directory exists (helpful on first deploy)
if (!fs.existsSync(uploadsPath)) {
  try {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('Created uploads directory at', uploadsPath);
  } catch (err) {
    console.error('Failed to create uploads directory:', err);
  }
}
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes); // Mount at /api to handle both project tasks and individual task operations
app.use('/api', noteRoutes); // Mount at /api to handle both project notes and individual note operations
app.use('/api/uploads', uploadRoutes);
app.use('/api/invites', inviteRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Project Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection with fallback support
async function connectAndStart() {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = process.env.MONGODB_URI_LOCAL;
  const PORT = process.env.PORT || 5000;

  const tryConnect = async (uri) => {
    if (!uri) return Promise.reject(new Error('No URI provided'));
    return mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  };

  try {
    if (primaryUri) {
      console.log('\u23F3 Attempting to connect to primary MongoDB URI...');
      await tryConnect(primaryUri);
      console.log('\u2705 Connected to MongoDB (primary)');
    } else if (fallbackUri) {
      console.log('\u23F3 No primary URI set; attempting local MongoDB...');
      await tryConnect(fallbackUri);
      console.log('\u2705 Connected to MongoDB (local fallback)');
    } else {
      throw new Error('No MongoDB URI configured (set MONGODB_URI or MONGODB_URI_LOCAL)');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('\u274c MongoDB connection error:', error.message || error);
    // If primary failed and fallback exists, try fallback
    if (primaryUri && fallbackUri) {
      try {
        console.log('\u23F3 Primary failed, attempting fallback MongoDB URI...');
        await tryConnect(fallbackUri);
        console.log('\u2705 Connected to MongoDB (fallback)');
        app.listen(PORT, () => {
          console.log(`🚀 Server running on port ${PORT}`);
          console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
        });
        return;
      } catch (err2) {
        console.error('\u274c Fallback MongoDB connection also failed:', err2.message || err2);
      }
    }

    console.error('\nHelpful tips:');
    console.error('- If you are using MongoDB Atlas, make sure your current IP is added to the Project Network Access IP whitelist (or add 0.0.0.0/0 for development)');
    console.error('- Confirm the username/password in your MONGODB_URI are correct and the user has access to the cluster');
    console.error('- If you prefer to run locally, install and start MongoDB and set MONGODB_URI_LOCAL=mongodb://localhost:27017/project_management');
    // Keep nodemon alive so developer can edit files; do not exit the process forcibly
  }
}

connectAndStart();

module.exports = app;
