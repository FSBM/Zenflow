const express = require('express');
const auth = require('../middleware/auth');
const Invite = require('../models/Invite');
const Project = require('../models/Project');

const router = express.Router();

// GET /api/invites - get invites for current user
router.get('/', auth, async (req, res) => {
  try {
    const invites = await Invite.find({ to: req.user._id, status: 'pending' })
      .populate('from', 'name email')
      .populate('project', 'title description');

    res.json({ invites });
  } catch (err) {
    console.error('Fetch invites error:', err);
    res.status(500).json({ message: 'Server error while fetching invites' });
  }
});

// POST /api/invites/:id/respond - accept or decline invite
router.post('/:id/respond', auth, async (req, res) => {
  try {
    const { action } = req.body; // 'accept' | 'decline'
    const invite = await Invite.findOne({ _id: req.params.id, to: req.user._id });
    if (!invite) return res.status(404).json({ message: 'Invite not found' });

    if (action === 'accept') {
      invite.status = 'accepted';
      await invite.save();
      // add user to project members if not already
      const project = await Project.findById(invite.project);
      if (project && !project.members.includes(req.user._id)) {
        project.members.push(req.user._id);
        await project.save();
      }
      return res.json({ message: 'Invite accepted' });
    }

    if (action === 'decline') {
      invite.status = 'declined';
      await invite.save();
      return res.json({ message: 'Invite declined' });
    }

    res.status(400).json({ message: 'Invalid action' });
  } catch (err) {
    console.error('Respond invite error:', err);
    res.status(500).json({ message: 'Server error while responding to invite' });
  }
});

module.exports = router;
