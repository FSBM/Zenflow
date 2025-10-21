const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project reference is required']
  },
  body: {
    type: String,
    required: [true, 'Note body is required'],
    trim: true,
    maxLength: [10000, 'Note cannot exceed 10000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
