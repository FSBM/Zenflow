const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Note = require('../models/Note');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .sort({ updatedAt: -1 });

    const { serializeMany, serializeDoc } = require('../utils/serializer');

    const mapped = projects.map(p => {
      const obj = serializeDoc(p);
      // add task counts
      return obj;
    });

    res.json(mapped);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      message: 'Server error while fetching projects'
    });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', auth, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
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

    const { title, description } = req.body;

    const project = new Project({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id] // Add owner as a member by default
    });

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(201).json({
      message: 'Project created successfully',
      project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      message: 'Server error while creating project'
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get a specific project with tasks and notes
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({
        message: 'Project not found or access denied'
      });
    }

    // Get tasks for this project
    let tasks = await Task.find({ project: project._1 })
      .populate('createdBy', 'name email')
      .populate('assignees', 'name email')
      .sort({ createdAt: -1 });

    // Fix: fall back to correct query if above fails
    if (!tasks || tasks.length === 0) {
      tasks = await Task.find({ project: project._id })
        .populate('createdBy', 'name email')
        .populate('assignees', 'name email')
        .sort({ createdAt: -1 });
    }

    // Map statuses/priorities to UI-friendly labels
    const statusMap = {
      'backlog': 'Backlog',
      'todo': 'Todo',
      'in-progress': 'In Progress',
      'done': 'Done',
      'canceled': 'Canceled'
    };
    const priorityMap = { 'low': 'Low', 'medium': 'Medium', 'high': 'High' };

    const mappedTasks = tasks.map(t => {
      const obj = t.toObject();
      obj.status = statusMap[obj.status] || obj.status;
      obj.priority = priorityMap[obj.priority] || obj.priority;
      return obj;
    });

    // Get notes for this project
    const notes = await Note.find({ project: project._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const { serializeDoc, serializeMany } = require('../utils/serializer');

    res.json({
      project: serializeDoc(project),
      tasks: serializeMany(mappedTasks),
      notes: serializeMany(notes)
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      message: 'Server error while fetching project'
    });
  }
});

// @route   PATCH /api/projects/:id
// @desc    Update a project
// @access  Private
router.patch('/:id', auth, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
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

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id // Only owner can update
    });

    if (!project) {
      return res.status(404).json({
        message: 'Project not found or you are not the owner'
      });
    }

    const { title, description } = req.body;
    
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.json({
      message: 'Project updated successfully',
      project
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      message: 'Server error while updating project'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id // Only owner can delete
    });

    if (!project) {
      return res.status(404).json({
        message: 'Project not found or you are not the owner'
      });
    }

    // Delete all associated tasks and notes
    await Task.deleteMany({ project: project._id });
    await Note.deleteMany({ project: project._id });
    
    // Delete the project
    await Project.findByIdAndDelete(project._id);

    res.json({
      message: 'Project and all associated data deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      message: 'Server error while deleting project'
    });
  }
});

module.exports = router;
