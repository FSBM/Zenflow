const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
