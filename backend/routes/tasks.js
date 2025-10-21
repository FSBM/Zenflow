const express = require('express');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');

const router = express.Router();

// @route   GET /api/projects/:projectId/tasks
// @desc    Get all tasks for a project with filtering
// @access  Private
router.get('/projects/:projectId/tasks', auth, [
  query('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Invalid status filter'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority filter'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term too long')
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

    // Build filter object
    const filter = { project: req.params.projectId };
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignees', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      message: 'Server error while fetching tasks'
    });
  }
});

// @route   POST /api/projects/:projectId/tasks
// @desc    Create a new task
// @access  Private
router.post('/projects/:projectId/tasks', auth, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
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

    const { title, description, status, priority, startDate, dueDate, price } = req.body;

    const task = new Task({
      project: req.params.projectId,
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      price: price || 0,
      createdBy: req.user._id,
      assignees: [req.user._id] // Assign to creator by default
    });

    await task.save();
    await task.populate('createdBy', 'name email');
    await task.populate('assignees', 'name email');

    res.status(201).json({
      message: 'Task created successfully',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      message: 'Server error while creating task'
    });
  }
});

// @route   PATCH /api/tasks/:id
// @desc    Update a task
// @access  Private
router.patch('/tasks/:id', auth, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
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

    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: task.project._id,
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

    const { title, description, status, priority, startDate, dueDate, price } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (startDate !== undefined) task.startDate = startDate ? new Date(startDate) : null;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (price !== undefined) task.price = price;

    await task.save();
    await task.populate('createdBy', 'name email');
    await task.populate('assignees', 'name email');

    res.json({
      message: 'Task updated successfully',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      message: 'Server error while updating task'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: task.project._id,
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

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      message: 'Server error while deleting task'
    });
  }
});

module.exports = router;
