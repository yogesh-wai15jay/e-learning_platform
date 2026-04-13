const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const questionsData = require('../data/questions');
const router = express.Router();

// Helper: check if two dates are within 12 hours
const isWithin12Hours = (date1, date2) => {
  const diffMs = Math.abs(date1 - date2);
  const hours = diffMs / (1000 * 60 * 60);
  return hours < 12;
};

// Get quiz questions (no lock here, just return shuffled options)
router.get('/:topicId', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    if (topicId !== 'secure-ai') {
      return res.status(404).json({ message: 'Quiz not available for this topic' });
    }

    const user = await User.findById(req.user.userId);
    const topicName = "Secure & Responsible AI Usage";
    const progress = user.topicsProgress.get(topicName) || { 
      completed: false, 
      lastQuizAttemptDate: null, 
      passed: false 
    };

    if (progress.completed) {
      return res.status(400).json({ message: 'Topic already completed. Cannot retake quiz.' });
    }

    // No lock on GET – we only lock on submission
    // Shuffle options while keeping letters A, B, C, D, E fixed
    const shuffledQuestions = questionsData.map(q => {
      const originalOptions = q.options.sort((a, b) => a.letter.localeCompare(b.letter));
      const texts = originalOptions.map(opt => opt.text);
      for (let i = texts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [texts[i], texts[j]] = [texts[j], texts[i]];
      }
      const shuffledOptions = originalOptions.map((opt, idx) => ({
        letter: opt.letter,
        text: texts[idx]
      }));
      return {
        id: q.id,
        text: q.text,
        options: shuffledOptions,
        correctAnswers: q.correctAnswers,
        explanation: q.explanation
      };
    });

    res.json({ questions: shuffledQuestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit quiz answers – this is where the 12‑hour lock is applied (on fail)
router.post('/:topicId/submit', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { answers } = req.body;

    if (topicId !== 'secure-ai') {
      return res.status(404).json({ message: 'Quiz not available for this topic' });
    }

    const user = await User.findById(req.user.userId);
    const topicName = "Secure & Responsible AI Usage";
    let progress = user.topicsProgress.get(topicName) || { 
      completed: false, 
      lastQuizAttemptDate: null, 
      passed: false 
    };

    if (progress.completed) {
      return res.status(400).json({ message: 'Topic already completed' });
    }

    const now = new Date();

    // If there is a previous failed attempt within 12 hours, block
    if (progress.lastQuizAttemptDate && !progress.passed && isWithin12Hours(progress.lastQuizAttemptDate, now)) {
      return res.status(400).json({ 
        message: 'You failed the quiz recently. Please wait 12 hours before trying again.' 
      });
    }

    // Calculate score
    let correctCount = 0;
    const results = [];

    for (let i = 0; i < questionsData.length; i++) {
      const question = questionsData[i];
      const userAnswer = answers[i] || [];

      const isCorrect = userAnswer.length === question.correctAnswers.length &&
        userAnswer.every(a => question.correctAnswers.includes(a));

      if (isCorrect) correctCount++;

      results.push({
        questionId: question.id,
        questionText: question.text,
        userAnswers: userAnswer,
        correctAnswers: question.correctAnswers,
        isCorrect,
        explanation: question.explanation
      });
    }

    const passed = correctCount >= 7;

    // Update progress
    progress = {
      completed: passed ? true : progress.completed,
      lastQuizAttemptDate: passed ? null : now,   // only store attempt date if failed
      passed: passed
    };

    user.topicsProgress.set(topicName, progress);
    await user.save();

    res.json({
      correctCount,
      totalQuestions: questionsData.length,
      passed,
      results,
      message: passed ? 'Congratulations! You passed the quiz.' : 'You did not pass. Please wait 12 hours before retrying.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;