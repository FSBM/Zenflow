const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  // Optional timeline and budget fields used by the frontend
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  price: {
    type: Number,
    default: 0
  },
  // Project status: ongoing, completed, on-hold, cancelled
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'on-hold', 'cancelled'],
    default: 'ongoing'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Attached files for this project (stored on disk under /uploads)
  files: [{
    filename: String,
    originalName: String,
    url: String,
    mimeType: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field on save
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
