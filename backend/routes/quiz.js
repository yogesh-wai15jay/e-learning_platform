const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const secureAiQuestions = require('../data/questions');
const leavePolicyQuestions = require('../data/leavePolicyQuestions');
const hardwarePolicyQuestions = require('../data/hardwarePolicyQuestions');
const serverPolicyQuestions = require('../data/serverPolicyQuestions');
const router = express.Router();

// Helper: check if two dates are within 6 hours
const isWithin6Hours = (date1, date2) => {
  const diffMs = Math.abs(date1 - date2);
  const hours = diffMs / (1000 * 60 * 60);
  return hours < 6;
};

// Helper to get quiz data based on topicId
const getQuizData = (topicId) => {
  if (topicId === 'secure-ai') {
    return {
      questions: secureAiQuestions,
      topicName: "Secure & Responsible AI Usage",
      passingScore: 7
    };
  } else if (topicId === 'leave-policy') {
    return {
      questions: leavePolicyQuestions,
      topicName: "Leave Policy",
      passingScore: 7   // 7 out of 10
    };
  } else if (topicId === 'hardware-policy') {
  return {
    questions: hardwarePolicyQuestions,
    topicName: "Hardware Policy",
    passingScore: 7   // 7 out of 10
  };
} else if (topicId === 'server-policy') {
  return {
    questions: serverPolicyQuestions,
    topicName: "Server Policy",
    passingScore: 7   // 7 out of 10
  };
}
  return null;
};

// Get quiz questions (no lock here, just return shuffled options)
router.get('/:topicId', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const quizData = getQuizData(topicId);
    if (!quizData) {
      return res.status(404).json({ message: 'Quiz not available for this topic' });
    }

    const user = await User.findById(req.user.userId);
    const progress = user.topicsProgress.get(quizData.topicName) || { 
      completed: false, 
      lastQuizAttemptDate: null, 
      passed: false 
    };

    if (progress.completed) {
      return res.status(400).json({ message: 'Topic already completed. Cannot retake quiz.' });
    }

    // Shuffle options while keeping letters A, B, C, ... fixed
    const shuffledQuestions = quizData.questions.map(q => {
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

// Submit quiz answers – 6‑hour lock applies only on failure
router.post('/:topicId/submit', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { answers } = req.body;

    const quizData = getQuizData(topicId);
    if (!quizData) {
      return res.status(404).json({ message: 'Quiz not available for this topic' });
    }

    const user = await User.findById(req.user.userId);
    let progress = user.topicsProgress.get(quizData.topicName) || { 
      completed: false, 
      lastQuizAttemptDate: null, 
      passed: false 
    };

    if (progress.completed) {
      return res.status(400).json({ message: 'Topic already completed' });
    }

    const now = new Date();

    // Block if there was a failed attempt within 6 hours
    if (progress.lastQuizAttemptDate && !progress.passed && isWithin6Hours(progress.lastQuizAttemptDate, now)) {
      return res.status(400).json({ 
        message: 'You failed the quiz recently. Please wait 6 hours before trying again.' 
      });
    }

    // Calculate score
    let correctCount = 0;
    const results = [];

    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i];
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

    const passed = correctCount >= quizData.passingScore;

    // Update progress
    progress = {
      completed: passed ? true : progress.completed,
      lastQuizAttemptDate: passed ? null : now,   // store attempt date only if failed
      passed: passed
    };

    user.topicsProgress.set(quizData.topicName, progress);

    // Record the attempt
user.quizAttempts.push({
  topicId: topicId,
  topicName: quizData.topicName,
  attemptDate: now,
  score: correctCount,
  totalQuestions: quizData.questions.length,
  passed: passed
});

    await user.save();

    res.json({
      correctCount,
      totalQuestions: quizData.questions.length,
      passed,
      results,
      message: passed ? 'Congratulations! You passed the quiz.' : 'You did not pass. Please wait 6 hours before retrying.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;