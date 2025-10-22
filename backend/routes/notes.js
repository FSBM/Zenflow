const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Note = require('../models/Note');
const Project = require('../models/Project');

const router = express.Router();

// @route   POST /api/projects/:projectId/notes
// @desc    Create a new note for a project
// @access  Private
router.post('/projects/:projectId/notes', auth, [
  body('body')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Note body must be between 1 and 10000 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({
        message: 'Project not found or access denied'
      });
    }

    const { body: noteBody } = req.body;

    const note = new Note({
      project: req.params.projectId,
      body: noteBody,
      createdBy: req.user._id
    });

    await note.save();
    await note.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Note created successfully',
      note
    });

  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      message: 'Server error while creating note'
    });
  }
});

// @route   GET /api/projects/:projectId/notes
// @desc    Get all notes for a project
// @access  Private
router.get('/projects/:projectId/notes', auth, async (req, res) => {
  try {
    // Check if user has access to the project
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({
        message: 'Project not found or access denied'
      });
    }

    const notes = await Note.find({ project: req.params.projectId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(notes);

  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      message: 'Server error while fetching notes'
    });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/notes/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('project');

    if (!note) {
      return res.status(404).json({
        message: 'Note not found'
      });
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: note.project._id,
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    });

    if (!project) {
      return res.status(403).json({
        message: 'Access denied to this project'
      });
    }

    // Only the creator or project owner can delete the note
    if (note.createdBy.toString() !== req.user._id.toString() && 
        project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You can only delete your own notes or you must be the project owner'
      });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      message: 'Server error while deleting note'
    });
  }
});

module.exports = router;
