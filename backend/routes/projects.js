const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Note = require('../models/Note');
const Invite = require('../models/Invite');
const User = require('../models/User');

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
      return p; // we'll transform later with counts (do not call toObject here to avoid duplicate work)
    });

    // For each project compute task totals and completed counts to help the UI
    const results = await Promise.all(mapped.map(async (proj) => {
      const obj = serializeDoc(proj);
      try {
        const total = await Task.countDocuments({ project: proj._id });
        const completed = await Task.countDocuments({ project: proj._id, status: 'done' });
        obj.tasksTotal = total;
        obj.tasksCompleted = completed;
      } catch (err) {
        // If counting fails for any reason, fall back to zeros
        obj.tasksTotal = obj.tasksTotal ?? 0;
        obj.tasksCompleted = obj.tasksCompleted ?? 0;
      }
      return obj;
    }));

    res.json(results);
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
    // Optional: price and member emails for invites
    const price = req.body.price !== undefined ? Number(req.body.price) : undefined;
    const memberEmails = Array.isArray(req.body.memberEmails) ? req.body.memberEmails : (typeof req.body.memberEmails === 'string' && req.body.memberEmails.trim() ? [req.body.memberEmails.trim()] : []);

    // Validate member emails: they must exist in users collection
    const normalizedEmails = memberEmails.map(e => String(e || '').toLowerCase().trim()).filter(Boolean);
    let foundUsers = [];
    if (normalizedEmails.length > 0) {
      foundUsers = await User.find({ email: { $in: normalizedEmails } });
      const foundEmails = foundUsers.map(u => u.email.toLowerCase());
      const missing = normalizedEmails.filter(e => !foundEmails.includes(e));
      if (missing.length > 0) {
        return res.status(400).json({ message: 'Some member emails were not found', missing });
      }
    }

    const project = new Project({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id], // Add owner as a member by default
    });
    if (!Number.isNaN(price)) project.price = price;

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    // Create invites for found users (excluding owner)
    for (const u of foundUsers) {
      if (u._id.toString() === req.user._id.toString()) continue;
      const existingInvite = await Invite.findOne({ project: project._id, to: u._id, status: 'pending' });
      if (!existingInvite) {
        await Invite.create({ project: project._id, from: req.user._id, to: u._id });
      }
    }

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

    // Get tasks for this project (defensive: ensure we query using a valid id)
    const projectId = project && project._id ? project._id : null;
    let tasks = [];
    if (projectId) {
      tasks = await Task.find({ project: projectId })
        .populate('createdBy', 'name email')
        .populate('assignees', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Shouldn't happen because we validated project existence above, but guard anyway
      tasks = [];
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
  // allow updating a few optional fields from the UI
  if (req.body.price !== undefined) project.price = Number(req.body.price);
  if (req.body.startDate !== undefined) project.startDate = req.body.startDate ? new Date(req.body.startDate) : undefined;
  if (req.body.endDate !== undefined) project.endDate = req.body.endDate ? new Date(req.body.endDate) : undefined;
  if (req.body.status !== undefined && ['ongoing','completed','on-hold','cancelled'].includes(req.body.status)) project.status = req.body.status;

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

// @route POST /api/projects/:id/invite
// @desc  Invite a user (by email) to the project (owner only)
router.post('/:id/invite', auth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found or you are not the owner' });

    // find user by email
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User with this email not found' });

    // don't invite owner or existing member
    if (project.owner.toString() === user._id.toString() || project.members.map(m => m.toString()).includes(user._id.toString())) {
      return res.status(400).json({ message: 'User is already part of the project' });
    }

    const existingInvite = await Invite.findOne({ project: project._id, to: user._id, status: 'pending' });
    if (existingInvite) return res.status(400).json({ message: 'Invite already exists' });

    const invite = await Invite.create({ project: project._id, from: req.user._id, to: user._id });
    res.status(201).json({ message: 'Invite created', invite });
  } catch (err) {
    console.error('Create invite error', err);
    res.status(500).json({ message: 'Server error while creating invite' });
  }
});

module.exports = router;
