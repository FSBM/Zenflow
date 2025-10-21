const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project reference is required']
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['todo', 'in-progress', 'done'],
      message: 'Status must be one of: todo, in-progress, done'
    },
    default: 'todo'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be one of: low, medium, high'
    },
    default: 'medium'
  },
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate that dueDate is after startDate
taskSchema.pre('save', function(next) {
  if (this.startDate && this.dueDate && this.startDate > this.dueDate) {
    return next(new Error('Due date must be after start date'));
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
