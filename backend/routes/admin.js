const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Get quiz attempts for a specific user
router.get('/users/:userId/attempts', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('quizAttempts name email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ name: user.name, email: user.email, attempts: user.quizAttempts });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send acknowledgement email for a passed topic
router.post('/users/:userId/acknowledge/:topicId', auth, isAdmin, async (req, res) => {
  try {
    const { userId, topicId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find the latest passed attempt for this topic
    const passedAttempts = user.quizAttempts.filter(a => a.topicId === topicId && a.passed === true);
    if (passedAttempts.length === 0) {
      return res.status(400).json({ message: 'No passed attempt found for this topic' });
    }
    const latest = passedAttempts.sort((a, b) => b.attemptDate - a.attemptDate)[0];

    // Send email
    const { sendAcknowledgementEmail } = require('../utils/emailService');
    await sendAcknowledgementEmail(user.name, user.email, latest.topicName, latest.score, latest.totalQuestions);

    res.json({ message: 'Acknowledgement email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get all users with progress as plain objects
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    const usersWithProgress = users.map(user => {
      // Convert Map to plain object
      const topicsProgressObj = {};
      if (user.topicsProgress) {
        for (const [key, value] of user.topicsProgress.entries()) {
          topicsProgressObj[key] = value;
        }
      }
      const moduleProgressObj = {};
      if (user.moduleProgress) {
        for (const [key, value] of user.moduleProgress.entries()) {
          moduleProgressObj[key] = value;
        }
      }
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        topicsProgress: topicsProgressObj,
        moduleProgress: moduleProgressObj
      };
    });
    res.json(usersWithProgress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE user
router.delete('/users/:userId', auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.userId) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;