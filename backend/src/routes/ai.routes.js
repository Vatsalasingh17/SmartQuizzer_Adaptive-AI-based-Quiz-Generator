const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST /api/v1/ai/generate-quiz
router.post('/generate-quiz', aiController.generateQuiz);

// POST /api/v1/ai/generate-feedback
router.post('/generate-feedback', aiController.generateFeedback);

// POST /api/v1/ai/generate-quiz-from-content
router.post('/generate-quiz-from-content', aiController.generateQuizFromContent);

module.exports = router;
